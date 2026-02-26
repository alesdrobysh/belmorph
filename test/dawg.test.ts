import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { DawgReader } from '../src/dawg/dawg-reader.js';

let dawg: DawgReader;

beforeAll(() => {
  const dictDir = resolve(import.meta.dirname, '..', 'dict');
  const buf = gunzipSync(readFileSync(resolve(dictDir, 'dict.dawg.gz')));
  dawg = new DawgReader(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
});

describe('DawgReader', () => {
  it('finds known words', () => {
    const results = dawg.lookup('горад');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds inflected forms', () => {
    const results = dawg.lookup('гарадамі');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown words', () => {
    const results = dawg.lookup('xyznotaword');
    expect(results).toEqual([]);
  });

  it('returns empty for empty string', () => {
    const results = dawg.lookup('');
    expect(results).toEqual([]);
  });

  it('returns entries with valid indices', () => {
    const results = dawg.lookup('горад');
    for (const r of results) {
      expect(r.paradigmId).toBeGreaterThanOrEqual(0);
      expect(r.paradigmId).toBeLessThan(10000);
      expect(r.formIdx).toBeGreaterThanOrEqual(0);
    }
  });
});
