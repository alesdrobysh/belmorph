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

export interface MetaJson {
  version: number;
  tagTable: string[];
  paradigmTags: string[];
  paradigmCount: number;
  paradigmCounts?: number[];
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
export function readParadigms(buf: Uint8Array, paradigmTags: string[]): Paradigm[] {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const decoder = new TextDecoder();
  let pos = 0;
  const count = view.getUint32(pos, true); pos += 4;
  const paradigms: Paradigm[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const paradigmTagIdx = buf[pos++];
    const paradigmTag = paradigmTags[paradigmTagIdx];

    const lemmaSuffixLen = buf[pos++];
    const lemmaSuffix = decoder.decode(buf.subarray(pos, pos + lemmaSuffixLen));
    pos += lemmaSuffixLen;

    const entryCount = view.getUint16(pos, true); pos += 2;
    const entries: ParadigmEntry[] = new Array(entryCount);

    for (let j = 0; j < entryCount; j++) {
      const tagId = view.getUint16(pos, true); pos += 2;
      const suffixLen = buf[pos++];
      const suffix = decoder.decode(buf.subarray(pos, pos + suffixLen));
      pos += suffixLen;
      entries[j] = { tagId, suffix };
    }

    paradigms[i] = { entries, paradigmTag, lemmaSuffix };
  }

  return paradigms;
}

async function decompressGzip(response: Response): Promise<Uint8Array> {
  // If the server set Content-Encoding: gzip, the browser already decompressed
  // the body transparently before JS sees it — skip DecompressionStream.
  if (response.headers.get('content-encoding')?.includes('gzip')) {
    return new Uint8Array(await response.arrayBuffer());
  }
  const stream = response.body!.pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Load dictionary files from a URL base (browser, Deno, Node.js 18+).
 * Fetches and decompresses all dict files using the Fetch API.
 */
export async function loadDictAsync(baseUrl: string | URL = '/dict/'): Promise<DictData> {
  const base = baseUrl.toString().replace(/\/?$/, '/');
  const [meta, dawgBuf, paradigmsBuf, predictBuf] = await Promise.all([
    fetch(base + 'meta.json').then(r => r.json() as Promise<MetaJson>),
    fetch(base + 'dict.dawg.gz').then(decompressGzip),
    fetch(base + 'paradigms.bin.gz').then(decompressGzip),
    fetch(base + 'predict.dawg.gz').then(decompressGzip),
  ]);
  const dawg = new DawgReader(dawgBuf.buffer as ArrayBuffer);
  const predictDawg = new DawgReader(predictBuf.buffer as ArrayBuffer);
  return {
    dawg,
    predictDawg,
    paradigms: readParadigms(paradigmsBuf, meta.paradigmTags),
    tagTable: meta.tagTable,
    paradigmCounts: meta.paradigmCounts ?? [],
  };
}
