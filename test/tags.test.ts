import { describe, it, expect } from 'vitest';
import { decodeFormTag, decodeParadigmTag, posFromParadigmTag, matchesGrammeme, normalizeGrammeme } from '../src/tags.js';

describe('decodeFormTag', () => {
  it('decodes nominal tags with gender', () => {
    expect(decodeFormTag('MNS')).toEqual({ gender: 'M', case: 'N', number: 'S' });
    expect(decodeFormTag('FGP')).toEqual({ gender: 'F', case: 'G', number: 'P' });
    expect(decodeFormTag('NAS')).toEqual({ gender: 'N', case: 'A', number: 'S' });
  });

  it('decodes nominal tags without gender', () => {
    expect(decodeFormTag('NS')).toEqual({ case: 'N', number: 'S' });
    expect(decodeFormTag('GP')).toEqual({ case: 'G', number: 'P' });
    expect(decodeFormTag('IP')).toEqual({ case: 'I', number: 'P' });
  });

  it('decodes verb present tense with indicative mood', () => {
    expect(decodeFormTag('R1S')).toEqual({ tense: 'R', person: '1', number: 'S', mood: 'I' });
    expect(decodeFormTag('R3P')).toEqual({ tense: 'R', person: '3', number: 'P', mood: 'I' });
  });

  it('decodes verb future tense with indicative mood', () => {
    expect(decodeFormTag('F1S')).toEqual({ tense: 'F', person: '1', number: 'S', mood: 'I' });
    expect(decodeFormTag('F3P')).toEqual({ tense: 'F', person: '3', number: 'P', mood: 'I' });
  });

  it('decodes verb past tense with indicative mood', () => {
    expect(decodeFormTag('PMS')).toEqual({ tense: 'P', gender: 'M', number: 'S', mood: 'I' });
    expect(decodeFormTag('PFS')).toEqual({ tense: 'P', gender: 'F', number: 'S', mood: 'I' });
    expect(decodeFormTag('PXP')).toEqual({ tense: 'P', number: 'P', mood: 'I' });
  });

  it('decodes imperative', () => {
    expect(decodeFormTag('I2S')).toEqual({ mood: 'M', person: '2', number: 'S' });
    expect(decodeFormTag('I2P')).toEqual({ mood: 'M', person: '2', number: 'P' });
  });

  it('decodes infinitive and base forms', () => {
    expect(decodeFormTag('0')).toEqual({});
    expect(decodeFormTag('')).toEqual({});
  });

  it('decodes gerund without mood', () => {
    expect(decodeFormTag('RG')).toEqual({});
  });

  it('decodes participial forms with 0-prefix', () => {
    expect(decodeFormTag('0NS')).toEqual({ case: 'N', number: 'S' });
    expect(decodeFormTag('0GP')).toEqual({ case: 'G', number: 'P' });
  });

  it('decodes short predicative participle forms (no case)', () => {
    expect(decodeFormTag('MHS')).toEqual({ gender: 'M', number: 'S' });
    expect(decodeFormTag('FHS')).toEqual({ gender: 'F', number: 'S' });
    expect(decodeFormTag('NHS')).toEqual({ gender: 'N', number: 'S' });
  });

  it('decodes vocative', () => {
    expect(decodeFormTag('VS')).toEqual({ case: 'V', number: 'S' });
  });
});

describe('posFromParadigmTag', () => {
  it('decodes POS from paradigm tag prefix using GrammarDB codes directly', () => {
    expect(posFromParadigmTag('NCIINM1')).toBe('N'); // noun
    expect(posFromParadigmTag('ARP')).toBe('A');      // adjective
    expect(posFromParadigmTag('VDMN1')).toBe('V');    // verb
    expect(posFromParadigmTag('PAPM')).toBe('P');     // participle
    expect(posFromParadigmTag('RA')).toBe('R');        // adverb
    expect(posFromParadigmTag('SNE0')).toBe('S');      // pronoun
    expect(posFromParadigmTag('CKX')).toBe('C');       // conjunction
    expect(posFromParadigmTag('E')).toBe('E');         // particle
    expect(posFromParadigmTag('Y')).toBe('Y');         // interjection
    expect(posFromParadigmTag('MACS')).toBe('M');      // numeral
    expect(posFromParadigmTag('I')).toBe('I');         // preposition
  });

  it('returns undefined for empty tag', () => {
    expect(posFromParadigmTag('')).toBeUndefined();
  });
});

describe('decodeParadigmTag', () => {
  it('decodes noun — no aspect or voice', () => {
    expect(decodeParadigmTag('NCIINM1')).toEqual({ pos: 'N' });
  });

  it('decodes perfective verb', () => {
    expect(decodeParadigmTag('VTPN1')).toEqual({ pos: 'V', aspect: 'P' });
  });

  it('decodes imperfective verb', () => {
    expect(decodeParadigmTag('VIMN2')).toEqual({ pos: 'V', aspect: 'M' });
  });

  it('decodes active participle, imperfective', () => {
    expect(decodeParadigmTag('PAPM')).toEqual({ pos: 'P', voice: 'A', aspect: 'M' });
  });

  it('decodes passive participle, perfective', () => {
    expect(decodeParadigmTag('PPPP')).toEqual({ pos: 'P', voice: 'P', aspect: 'P' });
  });

  it('decodes adjective — no aspect or voice', () => {
    expect(decodeParadigmTag('ARP')).toEqual({ pos: 'A' });
  });

  it('decodes adverb — no aspect or voice', () => {
    expect(decodeParadigmTag('RA')).toEqual({ pos: 'R' });
  });

  it('handles short special-case verb tags gracefully', () => {
    expect(decodeParadigmTag('V+')).toEqual({ pos: 'V' });
  });

  it('returns empty grammeme for empty tag', () => {
    expect(decodeParadigmTag('')).toEqual({});
  });
});

describe('matchesGrammeme', () => {
  it('matches partial grammeme', () => {
    const g = { pos: 'N' as const, case: 'I' as const, number: 'P' as const };
    expect(matchesGrammeme(g, { case: 'I', number: 'P' })).toBe(true);
    expect(matchesGrammeme(g, { case: 'G' })).toBe(false);
    expect(matchesGrammeme(g, {})).toBe(true);
  });
});

describe('normalizeGrammeme', () => {
  it('normalizes full names to short codes', () => {
    expect(normalizeGrammeme({ case: 'instrumental', number: 'plural' })).toEqual({ case: 'I', number: 'P' });
    expect(normalizeGrammeme({ case: 'genitive', number: 'singular' })).toEqual({ case: 'G', number: 'S' });
    expect(normalizeGrammeme({ pos: 'noun', gender: 'masculine' })).toEqual({ pos: 'N', gender: 'M' });
  });

  it('preserves short codes unchanged', () => {
    expect(normalizeGrammeme({ case: 'I', number: 'P' })).toEqual({ case: 'I', number: 'P' });
    expect(normalizeGrammeme({ case: 'G', number: 'S' })).toEqual({ case: 'G', number: 'S' });
  });

  it('handles mixed short codes and full names', () => {
    expect(normalizeGrammeme({ case: 'instrumental', number: 'P' })).toEqual({ case: 'I', number: 'P' });
    expect(normalizeGrammeme({ case: 'I', number: 'plural' })).toEqual({ case: 'I', number: 'P' });
  });

  it('normalizes aspect full names', () => {
    expect(normalizeGrammeme({ aspect: 'perfective' })).toEqual({ aspect: 'P' });
    expect(normalizeGrammeme({ aspect: 'imperfective' })).toEqual({ aspect: 'M' });
  });

  it('preserves aspect short codes unchanged', () => {
    expect(normalizeGrammeme({ aspect: 'P' })).toEqual({ aspect: 'P' });
    expect(normalizeGrammeme({ aspect: 'M' })).toEqual({ aspect: 'M' });
  });

  it('normalizes voice full names', () => {
    expect(normalizeGrammeme({ voice: 'active' })).toEqual({ voice: 'A' });
    expect(normalizeGrammeme({ voice: 'passive' })).toEqual({ voice: 'P' });
  });

  it('preserves voice short codes unchanged', () => {
    expect(normalizeGrammeme({ voice: 'A' })).toEqual({ voice: 'A' });
    expect(normalizeGrammeme({ voice: 'P' })).toEqual({ voice: 'P' });
  });

  it('normalizes new POS names', () => {
    expect(normalizeGrammeme({ pos: 'pronoun' })).toEqual({ pos: 'S' });
    expect(normalizeGrammeme({ pos: 'participle' })).toEqual({ pos: 'P' });
    expect(normalizeGrammeme({ pos: 'adverb' })).toEqual({ pos: 'R' });
    expect(normalizeGrammeme({ pos: 'particle' })).toEqual({ pos: 'E' });
    expect(normalizeGrammeme({ pos: 'interjection' })).toEqual({ pos: 'Y' });
    expect(normalizeGrammeme({ pos: 'numeral' })).toEqual({ pos: 'M' });
    expect(normalizeGrammeme({ pos: 'preposition' })).toEqual({ pos: 'I' });
  });
});
