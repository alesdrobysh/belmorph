import { describe, it, expect } from 'vitest';
import { decodeFormTag, posFromParadigmTag, matchesGrammeme, normalizeGrammeme } from '../src/tags.js';

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

  it('decodes verb present tense', () => {
    expect(decodeFormTag('R1S')).toEqual({ tense: 'R', person: '1', number: 'S' });
    expect(decodeFormTag('R3P')).toEqual({ tense: 'R', person: '3', number: 'P' });
  });

  it('decodes verb past tense', () => {
    expect(decodeFormTag('PMS')).toEqual({ tense: 'P', gender: 'M', number: 'S' });
    expect(decodeFormTag('PFS')).toEqual({ tense: 'P', gender: 'F', number: 'S' });
    expect(decodeFormTag('PXP')).toEqual({ tense: 'P', number: 'P' });
  });

  it('decodes imperative', () => {
    expect(decodeFormTag('I2S')).toEqual({ mood: 'M', person: '2', number: 'S' });
    expect(decodeFormTag('I2P')).toEqual({ mood: 'M', person: '2', number: 'P' });
  });

  it('decodes infinitive and base forms', () => {
    expect(decodeFormTag('0')).toEqual({});
    expect(decodeFormTag('')).toEqual({});
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
  it('decodes POS from paradigm tag prefix', () => {
    expect(posFromParadigmTag('NCIINM1')).toBe('N'); // noun
    expect(posFromParadigmTag('ARP')).toBe('A');      // adjective
    expect(posFromParadigmTag('VDMN1')).toBe('V');    // verb
    expect(posFromParadigmTag('PAPM')).toBe('A');     // participle → adjective
    expect(posFromParadigmTag('RA')).toBe('E');        // adverb
    expect(posFromParadigmTag('SNE0')).toBe('P');      // pronoun
    expect(posFromParadigmTag('CKX')).toBe('C');       // conjunction
    expect(posFromParadigmTag('E')).toBe('Z');         // particle
    expect(posFromParadigmTag('Y')).toBe('I');         // interjection
    expect(posFromParadigmTag('MACS')).toBeUndefined(); // numeral — no Pos code
    expect(posFromParadigmTag('I')).toBeUndefined();    // preposition — no Pos code
  });

  it('returns undefined for empty tag', () => {
    expect(posFromParadigmTag('')).toBeUndefined();
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
});
