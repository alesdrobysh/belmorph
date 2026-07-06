import { describe, it, expect, beforeAll } from 'vitest';
import { MorphAnalyzer } from '../src/analyzer.js';
import { loadDict } from '../src/node-loader.js';
import { TextAnalyzer } from '../src/text-analyzer.js';
import { TokenType } from '../src/tokens/types.js';
import { resolve } from 'node:path';

let analyzer: TextAnalyzer;

beforeAll(() => {
  const morph = new MorphAnalyzer(loadDict(resolve(import.meta.dirname, '..', 'dict')));
  analyzer = new TextAnalyzer(morph);
});

describe('TextAnalyzer', () => {
  it('analyzes a simple Belarusian sentence', () => {
    const results = analyzer.analyze('горад прыгожы');
    const words = results.filter(r => r.parse !== null);
    expect(words).toHaveLength(2);
    expect(words[0]!.parse!.lemma).toBe('горад');
    expect(words[0]!.parse!.tags.pos).toBe('N');
    expect(words[1]!.parse!.lemma).toBe('прыгожы');
    expect(words[1]!.parse!.tags.pos).toBe('A');
  });

  it('returns null parse for non-word tokens', () => {
    const results = analyzer.analyze('словы, гарады!');
    const nonWords = results.filter(r => r.parse === null);
    // At least the comma, space, and exclamation mark
    expect(nonWords.length).toBeGreaterThanOrEqual(3);

    const puncts = nonWords.filter(r => r.token.type === TokenType.PUNCT);
    expect(puncts.length).toBe(2); // comma and exclamation
  });

  it('words() returns only WORD tokens with parses', () => {
    const words = analyzer.words('кніга, тавар!');
    expect(words).toHaveLength(2);
    expect(words.every(w => w.parse !== null)).toBe(true);
    expect(words[0]!.parse!.lemma).toBe('кніга');
    expect(words[1]!.parse!.lemma).toBe('тавар');
  });

  it('handles words with apostrophe', () => {
    const words = analyzer.words("аб'ява");
    expect(words).toHaveLength(1);
    expect(words[0]!.parse!.lemma).toBe("аб'ява");
  });

  it('handles hyphenated words', () => {
    const words = analyzer.words('што-небудзь');
    expect(words).toHaveLength(1);
    expect(words[0]!.parse!.lemma).toBe('што-небудзь');
  });

  it('handles unknown words gracefully', () => {
    const results = analyzer.analyze('xyzabc');
    expect(results).toHaveLength(1);
    expect(results[0]!.parse).toBeNull();
  });
});
