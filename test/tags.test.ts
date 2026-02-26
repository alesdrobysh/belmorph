import { describe, it, expect } from 'vitest';
import { decodeFormTag, posFromParadigmTag, matchesGrammeme } from '../src/tags.js';

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

  it('decodes vocative', () => {
    expect(decodeFormTag('MHS')).toEqual({ gender: 'M', case: 'H', number: 'S' });
  });
});

describe('posFromParadigmTag', () => {
  it('decodes POS from paradigm tag prefix', () => {
    expect(posFromParadigmTag('NCIINM1')).toBe('N');
    expect(posFromParadigmTag('ARP')).toBe('A');
    expect(posFromParadigmTag('VDMN1')).toBe('V');
    expect(posFromParadigmTag('E')).toBe('E');
    expect(posFromParadigmTag('I')).toBe('I');
    expect(posFromParadigmTag('MACS')).toBe('P');
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
