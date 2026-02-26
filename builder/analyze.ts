import type { RawWord } from './extract.js';

export interface ParadigmEntry {
  tagId: number;   // index into tagTable
  suffix: string;
}

export interface Paradigm {
  entries: ParadigmEntry[];
  paradigmTag: string;
  lemmaSuffix: string;
}

export interface AnalyzedWord {
  stem: string;
  paradigmId: number;
}

export interface AnalysisResult {
  words: AnalyzedWord[];
  paradigms: Paradigm[];
  tagTable: string[];
  paradigmCounts: number[];
}

/**
 * Compute the longest common prefix of an array of strings.
 */
function longestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    const s = strings[i];
    let j = 0;
    while (j < prefix.length && j < s.length && prefix[j] === s[j]) {
      j++;
    }
    prefix = prefix.slice(0, j);
    if (prefix === '') return '';
  }
  return prefix;
}

/**
 * Analyze raw words: compute stems and deduplicate paradigms.
 *
 * Each paradigm is now self-contained: it includes the paradigmTag and lemmaSuffix
 * so that lemmas can be reconstructed at query time without a separate words table.
 */
export function analyzeWords(rawWords: RawWord[]): AnalysisResult {
  // Build tag table (deduplicate form tag strings)
  const tagToId = new Map<string, number>();
  const tagTable: string[] = [];

  function getTagId(tag: string): number {
    let id = tagToId.get(tag);
    if (id === undefined) {
      id = tagTable.length;
      tagTable.push(tag);
      tagToId.set(tag, id);
    }
    return id;
  }

  // Deduplicate paradigms by their full key (paradigmTag + lemmaSuffix + entries)
  const paradigmMap = new Map<string, number>();
  const paradigms: Paradigm[] = [];

  function getParadigmId(entries: ParadigmEntry[], paradigmTag: string, lemmaSuffix: string): number {
    const key = paradigmTag + '|' + lemmaSuffix + '||' + entries.map(e => `${e.tagId}:${e.suffix}`).join('|');
    let id = paradigmMap.get(key);
    if (id === undefined) {
      id = paradigms.length;
      paradigms.push({ entries, paradigmTag, lemmaSuffix });
      paradigmMap.set(key, id);
    }
    return id;
  }

  const words: AnalyzedWord[] = [];

  for (const raw of rawWords) {
    // Collect all form texts including the lemma
    const allTexts = [raw.lemma, ...raw.forms.map(f => f.text)];
    const stem = longestCommonPrefix(allTexts);

    // Build paradigm entries: for each form, store tagId and suffix (text after stem)
    const entries: ParadigmEntry[] = raw.forms.map(f => ({
      tagId: getTagId(f.formTag),
      suffix: f.text.slice(stem.length),
    }));

    // lemmaSuffix: the part of the lemma after the stem
    const lemmaSuffix = raw.lemma.slice(stem.length);

    const paradigmId = getParadigmId(entries, raw.paradigmTag, lemmaSuffix);

    words.push({ stem, paradigmId });
  }

  // Compute paradigm counts: how many distinct stems use each paradigm
  const paradigmCounts = new Array<number>(paradigms.length).fill(0);
  for (const w of words) {
    paradigmCounts[w.paradigmId]++;
  }

  console.log(`  Analyzed ${rawWords.length} words → ${paradigms.length} unique paradigms, ${tagTable.length} form tags`);

  return { words, paradigms, tagTable, paradigmCounts };
}
