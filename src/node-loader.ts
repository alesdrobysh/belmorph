import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { DawgReader } from './dawg/dawg-reader.js';
import { readParadigms, type DictData, type MetaJson } from './data-loader.js';

/**
 * Load dictionary files from disk (Node.js only).
 * All binary files are gzip-compressed.
 */
export function loadDict(dictDir?: string): DictData {
  const dir = dictDir ?? join(import.meta.dirname, '..', 'dict');
  const meta: MetaJson = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf-8'));

  const dawgBuf = gunzipSync(readFileSync(join(dir, 'dict.dawg.gz')));
  const dawg = new DawgReader(
    dawgBuf.buffer.slice(dawgBuf.byteOffset, dawgBuf.byteOffset + dawgBuf.byteLength),
  );

  const paradigmsBuf = gunzipSync(readFileSync(join(dir, 'paradigms.bin.gz')));
  const paradigms = readParadigms(paradigmsBuf, meta.paradigmTags);

  const predictBuf = gunzipSync(readFileSync(join(dir, 'predict.dawg.gz')));
  const predictDawg = new DawgReader(
    predictBuf.buffer.slice(predictBuf.byteOffset, predictBuf.byteOffset + predictBuf.byteLength),
  );

  return { dawg, predictDawg, paradigms, tagTable: meta.tagTable, paradigmCounts: meta.paradigmCounts ?? [] };
}
