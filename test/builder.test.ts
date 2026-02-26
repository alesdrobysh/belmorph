import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dictDir = resolve(import.meta.dirname, '..', 'dict');

describe('builder output', () => {
  it('generates dict.dawg.gz', () => {
    expect(existsSync(resolve(dictDir, 'dict.dawg.gz'))).toBe(true);
  });

  it('generates paradigms.bin.gz', () => {
    expect(existsSync(resolve(dictDir, 'paradigms.bin.gz'))).toBe(true);
  });

  it('does not generate words.bin.gz (eliminated)', () => {
    expect(existsSync(resolve(dictDir, 'words.bin.gz'))).toBe(false);
  });

  it('generates predict.dawg.gz', () => {
    expect(existsSync(resolve(dictDir, 'predict.dawg.gz'))).toBe(true);
  });

  it('generates meta.json with correct structure', () => {
    const meta = JSON.parse(readFileSync(resolve(dictDir, 'meta.json'), 'utf-8'));
    expect(meta.version).toBe(4);
    expect(meta.paradigmCount).toBeGreaterThan(1000);
    expect(meta.tagTable).toBeInstanceOf(Array);
    expect(meta.tagTable.length).toBeGreaterThan(50);
    expect(meta.paradigmTags).toBeInstanceOf(Array);
    expect(meta.paradigmTags.length).toBeGreaterThan(100);
    expect(meta.paradigmCounts).toBeInstanceOf(Array);
    expect(meta.paradigmCounts.length).toBe(meta.paradigmCount);
    // No longer has lemmaOverrides or wordCount
    expect(meta.lemmaOverrides).toBeUndefined();
    expect(meta.wordCount).toBeUndefined();
  });

  it('dict.dawg.gz is under 10MB', () => {
    const stats = statSync(resolve(dictDir, 'dict.dawg.gz'));
    expect(stats.size).toBeLessThan(10 * 1024 * 1024);
  });

  it('total compressed size is under 10MB', () => {
    let total = 0;
    for (const f of ['dict.dawg.gz', 'predict.dawg.gz', 'paradigms.bin.gz', 'meta.json']) {
      total += statSync(resolve(dictDir, f)).size;
    }
    expect(total).toBeLessThan(10 * 1024 * 1024);
  });
});
