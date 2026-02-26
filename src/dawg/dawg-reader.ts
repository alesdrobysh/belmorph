import { CHAR_MAP } from './constants.js';

/**
 * Binary trie/DAFSA reader — zero dependencies, works with ArrayBuffer.
 *
 * Combined buffer format:
 *   [trieLength: uint32]        offset 0
 *   [rootOffset: uint32]        offset 4
 *   [trie section]              offset 8, length = trieLength
 *   [payload section]           offset 8 + trieLength
 *
 * Trie node layout (within trie section):
 *   [childCount: uint8]
 *   [flags: uint8]            bit 0: hasPayload
 *   [payloadOffset: uint32]   only if hasPayload (offset within payload section)
 *   For each child (sorted by charIndex):
 *     [charIndex: uint8]
 *     [childOffset: uint32]   offset within trie section
 *
 * Payload layout (within payload section):
 *   [count: uint16]
 *   [paradigmId: uint16, formIdx: uint8] × count   (3 bytes each)
 */
export interface LookupResult {
  paradigmId: number;
  formIdx: number;
}

export class DawgReader {
  private bytes: Uint8Array;
  private view: DataView;
  private trieBase: number;       // byte offset where trie section starts
  private payloadBase: number;    // byte offset where payload section starts
  private rootOffset: number;     // root node offset within trie section

  constructor(buffer: ArrayBuffer) {
    this.bytes = new Uint8Array(buffer);
    this.view = new DataView(buffer);

    const trieLength = this.view.getUint32(0, true);
    this.rootOffset = this.view.getUint32(4, true);
    this.trieBase = 8;
    this.payloadBase = 8 + trieLength;
  }

  lookup(word: string): LookupResult[] {
    let nodeOff = this.trieBase + this.rootOffset;

    for (const ch of word) {
      const charIdx = CHAR_MAP.get(ch);
      if (charIdx === undefined) return [];

      const childCount = this.bytes[nodeOff];
      const flags = this.bytes[nodeOff + 1];
      const hasPayload = (flags & 1) !== 0;

      const childrenStart = nodeOff + 2 + (hasPayload ? 4 : 0);
      const childOff = this.findChild(childrenStart, childCount, charIdx);
      if (childOff === -1) return [];

      nodeOff = this.trieBase + childOff;
    }

    // Check if terminal
    const flags = this.bytes[nodeOff + 1];
    if ((flags & 1) === 0) return [];

    const payloadOff = this.view.getUint32(nodeOff + 2, true);
    return this.readPayload(this.payloadBase + payloadOff);
  }

  /**
   * Walk the trie char by char, collecting payloads at every node along the path.
   * Used for prediction: deeper matches (longer suffix) rank higher.
   */
  collectAlongPath(word: string): Array<{ depth: number; results: LookupResult[] }> {
    const collected: Array<{ depth: number; results: LookupResult[] }> = [];
    let nodeOff = this.trieBase + this.rootOffset;

    for (let depth = 0; depth < word.length; depth++) {
      const ch = word[depth];
      const charIdx = CHAR_MAP.get(ch);
      if (charIdx === undefined) break;

      const childCount = this.bytes[nodeOff];
      const flags = this.bytes[nodeOff + 1];
      const hasPayload = (flags & 1) !== 0;

      const childrenStart = nodeOff + 2 + (hasPayload ? 4 : 0);
      const childOff = this.findChild(childrenStart, childCount, charIdx);
      if (childOff === -1) break;

      nodeOff = this.trieBase + childOff;

      // Check if this node has payloads
      const nodeFlags = this.bytes[nodeOff + 1];
      if ((nodeFlags & 1) !== 0) {
        const payloadOff = this.view.getUint32(nodeOff + 2, true);
        collected.push({ depth: depth + 1, results: this.readPayload(this.payloadBase + payloadOff) });
      }
    }

    return collected;
  }

  private findChild(start: number, count: number, target: number): number {
    let lo = 0;
    let hi = count - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const entryOff = start + mid * 5;
      const charIdx = this.bytes[entryOff];
      if (charIdx === target) {
        return this.view.getUint32(entryOff + 1, true);
      } else if (charIdx < target) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return -1;
  }

  private readPayload(offset: number): LookupResult[] {
    const count = this.view.getUint16(offset, true);
    const results: LookupResult[] = new Array(count);
    let pos = offset + 2;
    for (let i = 0; i < count; i++) {
      const paradigmId =
        this.bytes[pos] |
        (this.bytes[pos + 1] << 8);
      const formIdx = this.bytes[pos + 2];
      results[i] = { paradigmId, formIdx };
      pos += 3;
    }
    return results;
  }
}
