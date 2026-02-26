import type { AnalysisResult } from './analyze.js';
import {
  CHAR_MAP,
  createNode,
  insertForm,
  deduplicatePayloads,
  minimizeTrie,
  serializeDAG,
} from './compress.js';

const MAX_SUFFIX = 5;

/**
 * Build a reverse-suffix DAWG for predicting unknown words.
 *
 * For each word form in the dictionary, takes the last MAX_SUFFIX characters,
 * reverses them, and inserts into a trie with (paradigmId, formIdx) payload.
 * The trie is then deduplicated, minimized, and serialized identically to the main DAWG.
 */
export function buildPredictTrie(analysis: AnalysisResult): Buffer {
  const { words, paradigms } = analysis;

  console.log('  Building predict trie...');
  const root = createNode();
  let totalInsertions = 0;

  for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
    const word = words[wordIdx];
    const paradigm = paradigms[word.paradigmId];

    for (let formIdx = 0; formIdx < paradigm.entries.length; formIdx++) {
      const form = word.stem + paradigm.entries[formIdx].suffix;

      // Take last MAX_SUFFIX chars via Array.from for proper Unicode handling
      const chars = Array.from(form);
      const suffix = chars.slice(-MAX_SUFFIX);
      suffix.reverse();
      const reversed = suffix.join('');

      insertForm(root, reversed, word.paradigmId, formIdx);
      totalInsertions++;
    }

    if (wordIdx % 50000 === 0 && wordIdx > 0) {
      console.log(`    Inserted ${wordIdx}/${words.length} words...`);
    }
  }
  console.log(`  Total predict insertions: ${totalInsertions}`);

  console.log('  Deduplicating predict payloads...');
  const dedupStats = deduplicatePayloads(root);
  console.log(`  Payloads: ${dedupStats.before} → ${dedupStats.after}`);

  console.log('  Minimizing predict trie (DAFSA)...');
  const { root: minimizedRoot, originalNodes, uniqueNodes } = minimizeTrie(root);
  const reduction = ((1 - uniqueNodes / originalNodes) * 100).toFixed(1);
  console.log(`  DAFSA: ${originalNodes} → ${uniqueNodes} nodes (${reduction}% reduction)`);

  console.log('  Serializing predict trie...');
  return serializeDAG(minimizedRoot);
}
