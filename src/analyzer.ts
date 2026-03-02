import { loadDictAsync, type DictData } from './data-loader.js';
import { ParseResult } from './parse-result.js';

export class MorphAnalyzer {
  private dict: DictData;

  constructor(dict: DictData) {
    this.dict = dict;
  }

  static async init(baseUrl: string | URL = '/dict/'): Promise<MorphAnalyzer> {
    return new MorphAnalyzer(await loadDictAsync(baseUrl));
  }

  /**
   * Parse a word and return all possible morphological analyses.
   */
  parse(word: string): ParseResult[] {
    const normalized = word.toLowerCase();
    const lookups = this.dict.dawg.lookup(normalized);

    if (lookups.length > 0) {
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

    // No exact matches found, try prediction
    return this.predict(normalized);
  }

  /**
   * Predict morphological analysis for unknown words based on suffix patterns.
   */
  private predict(word: string): ParseResult[] {
    const MAX_SUFFIX = 5;

    // Reverse the word and take last MAX_SUFFIX chars
    const chars = Array.from(word);
    const truncated = chars.slice(-MAX_SUFFIX);
    truncated.reverse();
    const reversed = truncated.join('');

    // Collect all payloads along the path
    const hits = this.dict.predictDawg.collectAlongPath(reversed);
    if (hits.length === 0) return [];

    // Score candidates: depth (suffix length) + paradigm popularity
    const candidates = new Map<string, { score: number; paradigmId: number; formIdx: number }>();

    for (const { depth, results } of hits) {
      for (const { paradigmId, formIdx } of results) {
        const key = `${paradigmId}:${formIdx}`;
        const paradigmCount = this.dict.paradigmCounts[paradigmId] || 1;
        // Score: depth (suffix length) + log(paradigm popularity)
        const score = depth + Math.log(paradigmCount);

        const existing = candidates.get(key);
        if (!existing || score > existing.score) {
          candidates.set(key, { score, paradigmId, formIdx });
        }
      }
    }

    // Take top 3 candidates by score
    const sorted = [...candidates.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const results: ParseResult[] = [];
    for (const { paradigmId, formIdx } of sorted) {
      const paradigm = this.dict.paradigms[paradigmId];
      const suffix = paradigm.entries[formIdx].suffix;
      const stem = suffix.length > 0
        ? word.slice(0, word.length - suffix.length)
        : word;

      results.push(
        new ParseResult(word, stem, paradigm, formIdx, this.dict.tagTable, true),
      );
    }

    return results;
  }
}
