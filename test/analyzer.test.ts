import { describe, it, expect, beforeAll } from 'vitest';
import { MorphAnalyzer } from '../src/analyzer.js';
import { resolve } from 'node:path';

let morph: MorphAnalyzer;

beforeAll(() => {
  morph = new MorphAnalyzer(resolve(import.meta.dirname, '..', 'dict'));
});

describe('MorphAnalyzer.parse', () => {
  it('parses горад as a noun', () => {
    const results = morph.parse('горад');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].lemma).toBe('горад');
    expect(results[0].tags.pos).toBe('N');
  });

  it('parses гарадамі → lemma горад, inst plur', () => {
    const results = morph.parse('гарадамі');
    expect(results.length).toBeGreaterThan(0);
    const r = results.find(r => r.lemma === 'горад');
    expect(r).toBeDefined();
    expect(r!.tags.case).toBe('I');
    expect(r!.tags.number).toBe('P');
  });

  it('parses кніга as a noun', () => {
    const results = morph.parse('кніга');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].lemma).toBe('кніга');
    expect(results[0].tags.pos).toBe('N');
  });

  it('parses пісаць as a verb', () => {
    const results = morph.parse('пісаць');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].lemma).toBe('пісаць');
    expect(results[0].tags.pos).toBe('V');
  });

  it('parses вялікі as an adjective', () => {
    const results = morph.parse('вялікі');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].lemma).toBe('вялікі');
    expect(results[0].tags.pos).toBe('A');
  });

  it('returns empty for unknown words', () => {
    const results = morph.parse('xyzabc');
    expect(results).toEqual([]);
  });

  it('parses пісаць (imperfective verb) with aspect M', () => {
    const results = morph.parse('пісаць');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tags.pos).toBe('V');
    expect(results[0].tags.aspect).toBe('M');
  });

  it('parses напісаць (perfective verb) with aspect P', () => {
    const results = morph.parse('напісаць');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tags.pos).toBe('V');
    expect(results[0].tags.aspect).toBe('P');
  });
});

describe('ParseResult.inflect', () => {
  it('inflects горад to instrumental plural', () => {
    const city = morph.parse('горад')[0];
    const inflected = city.inflect({ case: 'I', number: 'P' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('гарадамі');
  });

  it('inflects горад to genitive singular', () => {
    const city = morph.parse('горад')[0];
    const inflected = city.inflect({ case: 'G', number: 'S' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('горада');
  });

  it('returns null for impossible inflection', () => {
    const city = morph.parse('горад')[0];
    const inflected = city.inflect({ tense: 'R', person: '1' });
    expect(inflected).toBeNull();
  });
});

describe('ParseResult.lexeme', () => {
  it('returns all forms of горад', () => {
    const city = morph.parse('горад')[0];
    const lexeme = city.lexeme;
    expect(lexeme.length).toBe(12); // 6 cases × 2 numbers
    const words = lexeme.map(r => r.word);
    expect(words).toContain('горад');
    expect(words).toContain('гарадамі');
    expect(words).toContain('горадзе');
    expect(words).toContain('гарадоў');
  });
});

describe('Full name grammeme support', () => {
  it('inflects горад to instrumental plural using full names', () => {
    const city = morph.parse('горад')[0];
    const inflected = city.inflect({ case: 'instrumental', number: 'plural' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('гарадамі');
  });

  it('inflects горад to genitive singular using full names', () => {
    const city = morph.parse('горад')[0];
    const inflected = city.inflect({ case: 'genitive', number: 'singular' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('горада');
  });

  it('inflects with mixed short and full names', () => {
    const city = morph.parse('горад')[0];
    const inflected1 = city.inflect({ case: 'instrumental', number: 'P' });
    const inflected2 = city.inflect({ case: 'I', number: 'plural' });
    expect(inflected1).not.toBeNull();
    expect(inflected2).not.toBeNull();
    expect(inflected1!.word).toBe('гарадамі');
    expect(inflected2!.word).toBe('гарадамі');
  });

  it('returns same result for short codes and full names', () => {
    const city = morph.parse('горад')[0];
    const shortResult = city.inflect({ case: 'I', number: 'P' });
    const fullResult = city.inflect({ case: 'instrumental', number: 'plural' });
    expect(shortResult).not.toBeNull();
    expect(fullResult).not.toBeNull();
    expect(shortResult!.word).toBe(fullResult!.word);
  });
});
