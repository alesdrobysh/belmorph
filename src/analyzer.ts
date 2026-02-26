import { join } from 'node:path';
import { loadDict, type DictData } from './data-loader.js';
import { ParseResult } from './parse-result.js';

export class MorphAnalyzer {
  private dict: DictData;

  constructor(dictPath?: string) {
    const dictDir = dictPath ?? join(import.meta.dirname, '..', 'dict');
    this.dict = loadDict(dictDir);
  }

  /**
   * Parse a word and return all possible morphological analyses.
   */
  parse(word: string): ParseResult[] {
    const normalized = word.toLowerCase();
    const lookups = this.dict.dawg.lookup(normalized);

    if (lookups.length === 0) return [];

    const results: ParseResult[] = [];
    // Deduplicate by paradigmId+formIdx (same paradigm can appear via multiple paths)
    const seen = new Set<string>();

    for (const { paradigmId, formIdx } of lookups) {
      const key = `${paradigmId}:${formIdx}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const paradigm = this.dict.paradigms[paradigmId];
      const suffix = paradigm.entries[formIdx].suffix;
      const stem = suffix.length > 0
        ? normalized.slice(0, normalized.length - suffix.length)
        : normalized;

      results.push(
        new ParseResult(normalized, stem, paradigm, formIdx, this.dict.tagTable),
      );
    }

    return results;
  }
}
