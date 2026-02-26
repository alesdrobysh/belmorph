import type { Grammeme, GrammemeInput } from './tags.js';
import { decodeFormTag, posFromParadigmTag, matchesGrammeme, normalizeGrammeme } from './tags.js';
import type { ParadigmEntry, Paradigm } from './data-loader.js';

export class ParseResult {
  /** The inflected word form that was parsed */
  readonly word: string;
  /** The lemma (dictionary form) */
  readonly lemma: string;
  /** Decoded grammatical tags */
  readonly tags: Grammeme;
  /** Whether this result was predicted (true) or exact match (false) */
  readonly predicted: boolean;

  /** @internal */
  private readonly _stem: string;
  /** @internal */
  private readonly _paradigm: Paradigm;
  /** @internal */
  private readonly _tagTable: string[];

  constructor(
    word: string,
    stem: string,
    paradigm: Paradigm,
    formIdx: number,
    tagTable: string[],
    predicted = false,
  ) {
    this.word = word;
    this._stem = stem;
    this._paradigm = paradigm;
    this._tagTable = tagTable;
    this.predicted = predicted;
    this.lemma = stem + paradigm.lemmaSuffix;

    // Decode tags: combine POS from paradigm tag + form grammemes
    const formTag = tagTable[paradigm.entries[formIdx].tagId];
    const formGrammeme = decodeFormTag(formTag);
    const pos = posFromParadigmTag(paradigm.paradigmTag);
    this.tags = { ...formGrammeme };
    if (pos) this.tags.pos = pos;
  }

  /**
   * Inflect to a target set of grammemes.
   * Returns a new ParseResult for the matching form, or null if not found.
   */
  inflect(target: GrammemeInput): ParseResult | null {
    const { _stem: stem, _paradigm: paradigm, _tagTable: tagTable } = this;
    const normalizedTarget = normalizeGrammeme(target);

    for (let i = 0; i < paradigm.entries.length; i++) {
      const formTag = tagTable[paradigm.entries[i].tagId];
      const grammeme = decodeFormTag(formTag);
      const pos = posFromParadigmTag(paradigm.paradigmTag);
      if (pos) grammeme.pos = pos;

      if (matchesGrammeme(grammeme, normalizedTarget)) {
        const form = stem + paradigm.entries[i].suffix;
        return new ParseResult(form, stem, paradigm, i, tagTable, this.predicted);
      }
    }

    return null;
  }

  /**
   * Get all forms of this word's paradigm.
   */
  get lexeme(): ParseResult[] {
    const { _stem: stem, _paradigm: paradigm, _tagTable: tagTable } = this;
    const results: ParseResult[] = [];

    for (let i = 0; i < paradigm.entries.length; i++) {
      const form = stem + paradigm.entries[i].suffix;
      results.push(new ParseResult(form, stem, paradigm, i, tagTable, this.predicted));
    }

    return results;
  }
}
