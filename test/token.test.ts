import { describe, it, expect } from 'vitest';
import { Token } from '../src/tokens/token.js';
import { TokenType, WordSubType } from '../src/tokens/types.js';

describe('Token', () => {
  const source = 'Прывітанне, Świat!';

  it('stores type, position, length, source', () => {
    const t = new Token(source, 0, 11, TokenType.WORD, WordSubType.CYRIL);
    expect(t.type).toBe(TokenType.WORD);
    expect(t.subType).toBe(WordSubType.CYRIL);
    expect(t.st).toBe(0);
    expect(t.length).toBe(11);
    expect(t.source).toBe(source);
  });

  it('toString() returns the token text', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.toString()).toBe('Прывітанне');
  });

  it('en returns exclusive end offset', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.en).toBe(10);
  });

  it('firstUpper detects uppercase first letter', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.firstUpper).toBe(true);
  });

  it('firstUpper is false for lowercase first letter', () => {
    const t = new Token('слова', 0, 5, TokenType.WORD);
    expect(t.firstUpper).toBe(false);
  });

  it('allUpper is true for all-caps', () => {
    const t = new Token('ГОРАД', 0, 5, TokenType.WORD);
    expect(t.allUpper).toBe(true);
  });

  it('allUpper is false for mixed case', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.allUpper).toBe(false);
  });

  it('isCapitalized() — first upper, rest lower', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.isCapitalized()).toBe(true);
  });

  it('isCapitalized() false for all-caps', () => {
    const t = new Token('ГОРАД', 0, 5, TokenType.WORD);
    expect(t.isCapitalized()).toBe(false);
  });

  it('toLowerCase() returns lowercase text', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.toLowerCase()).toBe('прывітанне');
  });

  it('indexOf() finds character position within token', () => {
    const t = new Token(source, 0, 10, TokenType.WORD);
    expect(t.indexOf('і')).toBe(4);
    expect(t.indexOf('x')).toBe(-1);
  });

  it('handles Latin tokens with correct subtype', () => {
    const t = new Token(source, 12, 5, TokenType.WORD, WordSubType.LATIN);
    expect(t.toString()).toBe('Świat');
    expect(t.subType).toBe(WordSubType.LATIN);
  });

  it('allUpper works with Latin uppercase', () => {
    const t = new Token('HELLO', 0, 5, TokenType.WORD, WordSubType.LATIN);
    expect(t.allUpper).toBe(true);
  });

  it('allUpper false for purely numeric tokens', () => {
    const t = new Token('422', 0, 3, TokenType.NUMBER);
    expect(t.allUpper).toBe(false);
    expect(t.firstUpper).toBe(false);
  });
});
