import { writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import type { AnalysisResult } from './analyze.js';

/**
 * Serialize analysis results to dict/ files (gzip-compressed).
 *
 * Files produced:
 * - dict.dawg.gz: combined trie + payload (gzipped)
 * - paradigms.bin.gz: packed paradigm data with paradigmTag and lemmaSuffix (gzipped)
 * - meta.json: metadata (tag table, stats)
 */
export function exportDict(
  outDir: string,
  analysis: AnalysisResult,
  dawgBuffer: Buffer,
  predictBuffer: Buffer,
): void {
  mkdirSync(outDir, { recursive: true });

  const { paradigms, tagTable } = analysis;

  // 1. Write combined trie+payload (gzipped)
  const dawgGz = gzipSync(dawgBuffer, { level: 9 });
  writeFileSync(join(outDir, 'dict.dawg.gz'), dawgGz);
  console.log(`  dict.dawg.gz: ${(dawgGz.length / 1024 / 1024).toFixed(1)} MB (raw ${(dawgBuffer.length / 1024 / 1024).toFixed(1)} MB)`);

  // 2. Write predict trie (gzipped)
  const predictGz = gzipSync(predictBuffer, { level: 9 });
  writeFileSync(join(outDir, 'predict.dawg.gz'), predictGz);
  console.log(`  predict.dawg.gz: ${(predictGz.length / 1024 / 1024).toFixed(1)} MB (raw ${(predictBuffer.length / 1024 / 1024).toFixed(1)} MB)`);

  // 3. Build paradigm tag table (deduplicated)
  const paradigmTagSet = new Set<string>();
  for (const p of paradigms) paradigmTagSet.add(p.paradigmTag);
  const paradigmTags = [...paradigmTagSet].sort();
  const paradigmTagToIdx = new Map<string, number>();
  paradigmTags.forEach((tag, idx) => paradigmTagToIdx.set(tag, idx));

  // 3. Serialize paradigms.bin (gzipped)
  // Format:
  //   [paradigmCount: uint32]
  //   Per paradigm:
  //     [paradigmTagIdx: uint8]
  //     [lemmaSuffixLen: uint8] [lemmaSuffix: bytes]
  //     [entryCount: uint16]
  //     Per entry: [tagId: uint16] [suffixLen: uint8] [suffix: bytes]
  const paradigmParts: Buffer[] = [];
  const headerBuf = Buffer.alloc(4);
  headerBuf.writeUInt32LE(paradigms.length, 0);
  paradigmParts.push(headerBuf);

  for (const paradigm of paradigms) {
    const lemmaSuffixBytes = Buffer.from(paradigm.lemmaSuffix, 'utf-8');
    const metaBuf = Buffer.alloc(2 + lemmaSuffixBytes.length + 2);
    let pos = 0;
    metaBuf[pos++] = paradigmTagToIdx.get(paradigm.paradigmTag)!;
    metaBuf[pos++] = lemmaSuffixBytes.length;
    lemmaSuffixBytes.copy(metaBuf, pos);
    pos += lemmaSuffixBytes.length;
    metaBuf.writeUInt16LE(paradigm.entries.length, pos);
    paradigmParts.push(metaBuf);

    for (const entry of paradigm.entries) {
      const suffixBytes = Buffer.from(entry.suffix, 'utf-8');
      const entryBuf = Buffer.alloc(3 + suffixBytes.length);
      entryBuf.writeUInt16LE(entry.tagId, 0);
      entryBuf[2] = suffixBytes.length;
      suffixBytes.copy(entryBuf, 3);
      paradigmParts.push(entryBuf);
    }
  }

  const paradigmsBin = Buffer.concat(paradigmParts);
  const paradigmsGz = gzipSync(paradigmsBin, { level: 9 });
  writeFileSync(join(outDir, 'paradigms.bin.gz'), paradigmsGz);
  console.log(`  paradigms.bin.gz: ${(paradigmsGz.length / 1024).toFixed(0)} KB (raw ${(paradigmsBin.length / 1024).toFixed(0)} KB)`);

  // 5. Write meta.json
  const meta = {
    version: 4,
    paradigmCount: paradigms.length,
    formTagCount: tagTable.length,
    tagTable,
    paradigmTags,
    paradigmCounts: analysis.paradigmCounts,
  };
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta));
  console.log(`  meta.json written`);

  // Print total
  const totalGz = dawgGz.length + predictGz.length + paradigmsGz.length;
  console.log(`\n  Total compressed: ${(totalGz / 1024 / 1024).toFixed(1)} MB`);
}
