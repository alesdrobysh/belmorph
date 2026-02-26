import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { DawgReader } from './dawg/dawg-reader.js';

export interface ParadigmEntry {
  tagId: number;
  suffix: string;
}

export interface Paradigm {
  entries: ParadigmEntry[];
  paradigmTag: string;
  lemmaSuffix: string;
}

export interface DictData {
  dawg: DawgReader;
  predictDawg: DawgReader;
  paradigms: Paradigm[];
  tagTable: string[];
  paradigmCounts: number[];
}

interface MetaJson {
  version: number;
  tagTable: string[];
  paradigmTags: string[];
  paradigmCount: number;
  paradigmCounts?: number[];
}

/**
 * Load dictionary files from disk (Node.js only).
 * All binary files are gzip-compressed.
 */
export function loadDict(dictDir: string): DictData {
  // Load meta first (needed for paradigm tags)
  const meta = JSON.parse(readFileSync(join(dictDir, 'meta.json'), 'utf-8')) as MetaJson;

  // Load combined trie+payload (gzipped)
  const dawgBuf = gunzipSync(readFileSync(join(dictDir, 'dict.dawg.gz')));
  const dawg = new DawgReader(
    dawgBuf.buffer.slice(dawgBuf.byteOffset, dawgBuf.byteOffset + dawgBuf.byteLength),
  );

  // Load paradigms (gzipped) — enhanced format with paradigmTag and lemmaSuffix
  const paradigmsBuf = gunzipSync(readFileSync(join(dictDir, 'paradigms.bin.gz')));
  const paradigms = readParadigms(paradigmsBuf, meta.paradigmTags);

  return { dawg, paradigms, tagTable: meta.tagTable };
}

/**
 * Read enhanced paradigms.bin format:
 *   [paradigmCount: uint32]
 *   Per paradigm:
 *     [paradigmTagIdx: uint8]
 *     [lemmaSuffixLen: uint8] [lemmaSuffix: bytes]
 *     [entryCount: uint16]
 *     Per entry: [tagId: uint16] [suffixLen: uint8] [suffix: bytes]
 */
function readParadigms(buf: Buffer, paradigmTags: string[]): Paradigm[] {
  let pos = 0;
  const count = buf.readUInt32LE(pos); pos += 4;
  const paradigms: Paradigm[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const paradigmTagIdx = buf[pos++];
    const paradigmTag = paradigmTags[paradigmTagIdx];

    const lemmaSuffixLen = buf[pos++];
    const lemmaSuffix = buf.subarray(pos, pos + lemmaSuffixLen).toString('utf-8');
    pos += lemmaSuffixLen;

    const entryCount = buf.readUInt16LE(pos); pos += 2;
    const entries: ParadigmEntry[] = new Array(entryCount);

    for (let j = 0; j < entryCount; j++) {
      const tagId = buf.readUInt16LE(pos); pos += 2;
      const suffixLen = buf[pos++];
      const suffix = buf.subarray(pos, pos + suffixLen).toString('utf-8');
      pos += suffixLen;
      entries[j] = { tagId, suffix };
    }

    paradigms[i] = { entries, paradigmTag, lemmaSuffix };
  }

  return paradigms;
}
