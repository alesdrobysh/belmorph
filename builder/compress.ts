import type { AnalysisResult } from './analyze.js';

/**
 * Alphabet mapping for Belarusian characters → compact indices.
 */
const CHAR_MAP = new Map<string, number>();
const CHARS: string[] = [];

const ALPHABET = 'абвгдежзійклмнопрстуўфхцчшыьэюя\'-';
for (let i = 0; i < ALPHABET.length; i++) {
  CHAR_MAP.set(ALPHABET[i], i);
  CHARS.push(ALPHABET[i]);
}

export { CHARS, CHAR_MAP };

export interface TrieNode {
  children: Map<number, TrieNode>;
  payloads: Array<{ paradigmId: number; formIdx: number }>;
}

export function createNode(): TrieNode {
  return { children: new Map(), payloads: [] };
}

/**
 * Build a packed trie, apply DAFSA minimization, and serialize to binary.
 *
 * Output is a single buffer containing both trie structure and payload data:
 *   [trieLength: uint32]
 *   [trieData: trieLength bytes]
 *   [payloadData: remaining bytes]
 */
export function buildTrie(analysis: AnalysisResult): Buffer {
  const { words, paradigms } = analysis;

  // Step 1: Build in-memory trie
  console.log('  Building trie...');
  const root = createNode();
  let totalInsertions = 0;

  for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
    const word = words[wordIdx];
    const paradigm = paradigms[word.paradigmId];

    for (let formIdx = 0; formIdx < paradigm.entries.length; formIdx++) {
      const form = word.stem + paradigm.entries[formIdx].suffix;
      insertForm(root, form, word.paradigmId, formIdx);
      totalInsertions++;
    }

    if (wordIdx % 50000 === 0 && wordIdx > 0) {
      console.log(`    Inserted ${wordIdx}/${words.length} words (${totalInsertions} forms)...`);
    }
  }
  console.log(`  Total form insertions: ${totalInsertions}`);

  // Step 2: Deduplicate payloads at each terminal node
  // Multiple words sharing the same paradigm insert identical (paradigmId, formIdx) tuples
  console.log('  Deduplicating payloads...');
  const dedupStats = deduplicatePayloads(root);
  console.log(`  Payloads: ${dedupStats.before} → ${dedupStats.after} (${((1 - dedupStats.after / dedupStats.before) * 100).toFixed(1)}% dedup)`);

  // Step 3: DAFSA minimization — merge nodes with identical subtrees
  console.log('  Minimizing trie (DAFSA)...');
  const { root: minimizedRoot, originalNodes, uniqueNodes } = minimizeTrie(root);
  const reduction = ((1 - uniqueNodes / originalNodes) * 100).toFixed(1);
  console.log(`  DAFSA: ${originalNodes} → ${uniqueNodes} nodes (${reduction}% reduction)`);

  // Step 4: Serialize the minimized DAG
  console.log('  Serializing...');
  return serializeDAG(minimizedRoot);
}

export function deduplicatePayloads(node: TrieNode): { before: number; after: number } {
  let totalBefore = 0;
  let totalAfter = 0;

  function walk(n: TrieNode): void {
    if (n.payloads.length > 1) {
      const before = n.payloads.length;
      const seen = new Set<string>();
      const unique: Array<{ paradigmId: number; formIdx: number }> = [];
      for (const p of n.payloads) {
        const key = `${p.paradigmId}:${p.formIdx}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(p);
        }
      }
      totalBefore += before;
      totalAfter += unique.length;
      n.payloads = unique;
    } else {
      totalBefore += n.payloads.length;
      totalAfter += n.payloads.length;
    }
    for (const child of n.children.values()) {
      walk(child);
    }
  }

  walk(node);
  return { before: totalBefore, after: totalAfter };
}

export function insertForm(root: TrieNode, form: string, paradigmId: number, formIdx: number): void {
  let node = root;
  for (const ch of form) {
    const charIdx = CHAR_MAP.get(ch);
    if (charIdx === undefined) return;
    let child = node.children.get(charIdx);
    if (!child) {
      child = createNode();
      node.children.set(charIdx, child);
    }
    node = child;
  }
  node.payloads.push({ paradigmId, formIdx });
}

// ─── DAFSA minimization ───

export function minimizeTrie(root: TrieNode): {
  root: TrieNode;
  originalNodes: number;
  uniqueNodes: number;
} {
  const registry = new Map<string, TrieNode>();
  const nodeIds = new Map<TrieNode, number>();
  let nextId = 0;
  let originalCount = 0;

  function minimize(node: TrieNode): TrieNode {
    originalCount++;

    // Bottom-up: minimize all children first
    const childEntries = [...node.children.entries()];
    for (const [charIdx, child] of childEntries) {
      node.children.set(charIdx, minimize(child));
    }

    // Compute signature based on canonical children IDs + payload content
    const sig = computeSignature(node, nodeIds);
    const existing = registry.get(sig);
    if (existing !== undefined) {
      return existing;
    }

    nodeIds.set(node, nextId++);
    registry.set(sig, node);
    return node;
  }

  const minimizedRoot = minimize(root);
  return {
    root: minimizedRoot,
    originalNodes: originalCount,
    uniqueNodes: registry.size,
  };
}

function computeSignature(node: TrieNode, nodeIds: Map<TrieNode, number>): string {
  // Build a string key from sorted children (charIdx:nodeId) + payload
  const sortedChildren = [...node.children.entries()].sort((a, b) => a[0] - b[0]);
  let sig = '';

  for (const [charIdx, child] of sortedChildren) {
    if (sig) sig += ',';
    sig += charIdx + ':' + nodeIds.get(child)!;
  }

  if (node.payloads.length > 0) {
    sig += '|';
    for (let i = 0; i < node.payloads.length; i++) {
      if (i > 0) sig += ';';
      sig += node.payloads[i].paradigmId + ',' + node.payloads[i].formIdx;
    }
  }

  return sig;
}

// ─── DAG serialization ───

/**
 * Serialize a minimized DAG (DAFSA) to a single buffer:
 *   [trieLength: uint32]
 *   [trie section]
 *   [payload section]
 *
 * Trie node layout:
 *   [childCount: uint8]
 *   [flags: uint8]            bit 0: hasPayload
 *   [payloadOffset: uint32]   only if hasPayload (offset within payload section)
 *   For each child (sorted by charIndex):
 *     [charIndex: uint8]
 *     [childOffset: uint32]   absolute offset within trie section
 *
 * Payload entry:
 *   [count: uint16]
 *   [paradigmId: uint16, formIdx: uint8] × count   (3 bytes each)
 */
export function serializeDAG(root: TrieNode): Buffer {
  // Collect all unique nodes in post-order (children before parents)
  const allNodes: TrieNode[] = [];
  const visited = new Set<TrieNode>();

  function collect(node: TrieNode): void {
    if (visited.has(node)) return;
    visited.add(node);
    const sortedChildren = [...node.children.entries()].sort((a, b) => a[0] - b[0]);
    for (const [, child] of sortedChildren) {
      collect(child);
    }
    allNodes.push(node);
  }
  collect(root);

  // Collect payloads and assign payload offsets
  const payloadOffsets = new Map<TrieNode, number>();
  let payloadTotalBytes = 0;
  for (const node of allNodes) {
    if (node.payloads.length > 0) {
      payloadOffsets.set(node, payloadTotalBytes);
      payloadTotalBytes += 2 + node.payloads.length * 3;  // 3 bytes per entry
    }
  }

  // Assign trie offsets to each node
  const nodeOffsets = new Map<TrieNode, number>();
  let trieTotalBytes = 0;
  for (const node of allNodes) {
    nodeOffsets.set(node, trieTotalBytes);
    const hasPayload = node.payloads.length > 0;
    const childCount = node.children.size;
    trieTotalBytes += 2 + (hasPayload ? 4 : 0) + childCount * 5;
  }

  // Build combined buffer: [trieLength:u32] [rootOffset:u32] [trie...] [payload...]
  const headerSize = 8; // trieLength + rootOffset
  const totalSize = headerSize + trieTotalBytes + payloadTotalBytes;
  const buf = Buffer.alloc(totalSize);

  // Header
  buf.writeUInt32LE(trieTotalBytes, 0);
  buf.writeUInt32LE(nodeOffsets.get(root)!, 4);

  // Write trie nodes
  for (const node of allNodes) {
    const sortedChildren = [...node.children.entries()].sort((a, b) => a[0] - b[0]);
    const hasPayload = node.payloads.length > 0;

    let pos = headerSize + nodeOffsets.get(node)!;
    buf[pos++] = sortedChildren.length;
    buf[pos++] = hasPayload ? 1 : 0;

    if (hasPayload) {
      buf.writeUInt32LE(payloadOffsets.get(node)!, pos);
      pos += 4;
    }

    for (const [charIdx, child] of sortedChildren) {
      buf[pos++] = charIdx;
      buf.writeUInt32LE(nodeOffsets.get(child)!, pos);
      pos += 4;
    }
  }

  // Write payload section — 3 bytes per entry: [paradigmId: u16 LE] [formIdx: u8]
  const payloadStart = headerSize + trieTotalBytes;
  for (const node of allNodes) {
    if (node.payloads.length === 0) continue;
    let pos = payloadStart + payloadOffsets.get(node)!;
    buf.writeUInt16LE(node.payloads.length, pos);
    pos += 2;
    for (const p of node.payloads) {
      buf[pos] = p.paradigmId & 0xFF;
      buf[pos + 1] = (p.paradigmId >> 8) & 0xFF;
      buf[pos + 2] = p.formIdx & 0xFF;
      pos += 3;
    }
  }

  console.log(`  Trie section: ${(trieTotalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Payload section: ${(payloadTotalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Combined: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

  return buf;
}
