import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DawgReader } from './dawg/dawg-reader.js';
import { readParadigms, type DictData, type MetaJson } from './data-loader.js';

function getDefaultDictDir(): string {
  // import.meta.dirname is available in Node.js 21.2+ native ESM
  if (typeof import.meta.dirname === 'string') {
    return join(import.meta.dirname, '..', 'dict');
  }
  // Fallback for older Node.js: derive from import.meta.url
  try {
    return join(fileURLToPath(new URL('..', import.meta.url)), 'dict');
  } catch {
    throw new Error(
      'Cannot resolve the belmorph dict directory automatically in this environment (e.g. bundlers like webpack/Next.js). ' +
      'Pass the path explicitly: loadDict(join(process.cwd(), "node_modules/belmorph/dict"))',
    );
  }
}

/**
 * Load dictionary files from disk (Node.js only).
 * All binary files are gzip-compressed.
 */
export function loadDict(dictDir?: string): DictData {
  const dir = dictDir ?? getDefaultDictDir();
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
