import type { Case, CaseName, Grammeme, GrammemeInput } from './tags.js';
import { decodeFormTag, decodeParadigmTag, matchesGrammeme, normalizeGrammeme } from './tags.js';
import type { ParadigmEntry, Paradigm } from './data-loader.js';

const numberAgreementRules = new Intl.PluralRules('be');

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

    // Decode tags: the paradigm supplies lexeme-level metadata; the form supplies inflection metadata.
    const formTag = tagTable[paradigm.entries[formIdx].tagId];
    const paradigmGrammeme = decodeParadigmTag(paradigm.paradigmTag, paradigm.government);
    const formGrammeme = decodeFormTag(formTag);
    this.tags = { ...paradigmGrammeme, ...formGrammeme };
  }

  /**
   * Inflect to a target set of grammemes.
   * Returns a new ParseResult for the matching form, or null if not found.
   */
  inflect(target: GrammemeInput): ParseResult | null {
    const { _stem: stem, _paradigm: paradigm, _tagTable: tagTable } = this;
    const normalizedTarget = normalizeGrammeme(target);

    const paradigmGrammeme = decodeParadigmTag(paradigm.paradigmTag, paradigm.government);

    for (let i = 0; i < paradigm.entries.length; i++) {
      const formTag = tagTable[paradigm.entries[i].tagId];
      const grammeme = { ...paradigmGrammeme, ...decodeFormTag(formTag) };

      if (matchesGrammeme(grammeme, normalizedTarget)) {
        const form = stem + paradigm.entries[i].suffix;
        return new ParseResult(form, stem, paradigm, i, tagTable, this.predicted);
      }
    }

    return null;
  }

  /**
   * Inflect to agree with a given count in a given case, following
   * Belarusian numeral agreement rules (extends pymorphy2's
   * `make_agree_with_number`).
   *
   * `targetCase` is the case the whole numeral phrase is governed by —
   * nominative by default (the plain "N штук" counting form), or an
   * oblique case such as dative when governed by a verb or preposition
   * (e.g. "давяраю пяці кнігам").
   *
   * Uses `Intl.PluralRules('be')` CLDR categories to determine agreement:
   * `one` counts (1, 21, ... — not 11) take singular in the target case;
   * `few` counts (2-4, 22-24, ... — not 12-14) take genitive singular for
   * nominative/accusative; everything else (`many`/`other`) takes genitive
   * plural. For any non-direct `targetCase` (genitive, dative, instrumental,
   * locative, vocative): that case is kept and only number changes —
   * singular for `one`, plural otherwise. The genitive-singular-for-`few`
   * quirk only applies to the direct-case counting form, not to oblique
   * government.
   */
  pluralize(count: number, targetCase: Case | CaseName = 'N'): ParseResult | null {
    const normalizedCase = normalizeGrammeme({ case: targetCase }).case as Case;

    const category = numberAgreementRules.select(count);
    const isSingularAgreement = category === 'one';

    const isDirectCase = normalizedCase === 'N' || normalizedCase === 'A';

    let target: GrammemeInput;
    if (!isDirectCase) {
      target = { case: normalizedCase, number: isSingularAgreement ? 'S' : 'P' };
    } else if (isSingularAgreement) {
      target = { case: normalizedCase, number: 'S' };
    } else if (category === 'few') {
      target = { case: 'G', number: 'S' };
    } else {
      target = { case: 'G', number: 'P' };
    }

    return this.inflect(target);
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
