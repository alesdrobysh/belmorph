import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/tokens/tokenizer.js';
import { TokenType } from '../src/tokens/types.js';

describe('Tokenizer', () => {
  it('tokenizes a simple Belarusian sentence', () => {
    const tokens = Tokenizer.tokenize('Мама мыла раму.');
    expect(tokens.length).toBe(6); // 3 words + 2 spaces + 1 punct
    expect(tokens[0]!.type).toBe(TokenType.WORD);
    expect(tokens[0]!.toString()).toBe('Мама');
    expect(tokens[2]!.toString()).toBe('мыла');
    expect(tokens[4]!.toString()).toBe('раму');
    expect(tokens[5]!.type).toBe(TokenType.PUNCT);
    expect(tokens[5]!.toString()).toBe('.');
  });

  it('preserves spaces as tokens', () => {
    const tokens = Tokenizer.tokenize('a b');
    const space = tokens.find(t => t.type === TokenType.SPACE);
    expect(space).toBeDefined();
    expect(space!.toString()).toBe(' ');
  });

  it('tokenizes newlines', () => {
    const tokens = Tokenizer.tokenize('line1\nline2');
    const nl = tokens.find(t => t.type === TokenType.NEWLINE);
    expect(nl).toBeDefined();
  });

  it('tokenizes Windows newlines (\\r\\n)', () => {
    const tokens = Tokenizer.tokenize('a\r\nb');
    const nl = tokens.find(t => t.type === TokenType.NEWLINE);
    expect(nl!.toString()).toBe('\r\n');
  });

  it('recognizes hashtags', () => {
    const tokens = Tokenizer.tokenize('#белмова гэта крута');
    const ht = tokens.find(t => t.type === TokenType.HASHTAG);
    expect(ht).toBeDefined();
    expect(ht!.toString()).toBe('#белмова');
  });

  it('does not treat number sign as hashtag', () => {
    const tokens = Tokenizer.tokenize('№5');
    expect(tokens.find(t => t.type === TokenType.HASHTAG)).toBeUndefined();
  });

  it('recognizes @mentions', () => {
    const tokens = Tokenizer.tokenize('прывітанне @карыстальнік!');
    const mention = tokens.find(t => t.type === TokenType.MENTION);
    expect(mention).toBeDefined();
    expect(mention!.toString()).toBe('@карыстальнік');
  });

  it('tokenizes numbers', () => {
    const tokens = Tokenizer.tokenize('42 і 3.14');
    const nums = tokens.filter(t => t.type === TokenType.NUMBER);
    expect(nums).toHaveLength(2);
    expect(nums[0]!.toString()).toBe('42');
    expect(nums[1]!.toString()).toBe('3.14');
  });

  it('tokenizes Belarusian-specific letters (ў, і, ё)', () => {
    const tokens = Tokenizer.tokenize('ўніверсітэт ёсць ісціна');
    const words = tokens.filter(t => t.type === TokenType.WORD);
    expect(words[0]!.toString()).toBe('ўніверсітэт');
    expect(words[1]!.toString()).toBe('ёсць');
    expect(words[2]!.toString()).toBe('ісціна');
  });

  it("handles apostrophe inside words (аб'ява)", () => {
    const tokens = Tokenizer.tokenize("аб'ява");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]!.toString()).toBe("аб'ява");
  });

  it('handles hyphenated words (што-небудзь)', () => {
    const tokens = Tokenizer.tokenize('што-небудзь');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]!.type).toBe(TokenType.WORD);
    expect(tokens[0]!.toString()).toBe('што-небудзь');
  });

  it('handles standalone em-dash as punctuation', () => {
    const tokens = Tokenizer.tokenize('Мінск — сталіца');
    const dash = tokens.find(t => t.toString() === '—');
    expect(dash).toBeDefined();
    expect(dash!.type).toBe(TokenType.PUNCT);
  });

  it('reconstructs original text from token strings', () => {
    const text = 'Прывітанне, свет!';
    const tokens = Tokenizer.tokenize(text);
    const back = tokens.map(t => t.toString()).join('');
    expect(back).toBe(text);
  });

  it('recognizes word subtypes (CYRIL, LATIN, MIXED)', () => {
    const tokens = Tokenizer.tokenize('бел Świat');
    const words = tokens.filter(t => t.type === TokenType.WORD);
    // 'бел' is Cyrillic
    expect(words[0]!.subType).toBe('CYRIL');
    // 'Świat' is Latin
    expect(words[1]!.subType).toBe('LATIN');
  });

  it('treats mixed-script as MIXED subtype', () => {
    // A word with Cyrillic and Latin mixed
    const tokens = Tokenizer.tokenize('белŚwiat');
    const word = tokens.find(t => t.type === TokenType.WORD);
    expect(word).toBeDefined();
    expect(word!.subType).toBe('MIXED');
  });

  it('tokenizes multiple hashtags', () => {
    const tokens = Tokenizer.tokenize('#мова #мовазнаўства');
    const hashtags = tokens.filter(t => t.type === TokenType.HASHTAG);
    expect(hashtags).toHaveLength(2);
  });

  describe('Tokenizer streaming (chunked append)', () => {
    it('correctly splits a word across chunks', () => {
      const t = new Tokenizer();
      t.append('Прывіта');
      t.append('нне');
      const tokens = t.done();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.toString()).toBe('Прывітанне');
    });

    it('handles punctuation at chunk boundary', () => {
      const t = new Tokenizer();
      t.append('слова');
      t.append(', яшчэ');
      const tokens = t.done();
      const text = tokens.map(tk => tk.toString()).join('');
      expect(text).toBe('слова, яшчэ');
    });

    it('handles empty chunks', () => {
      const t = new Tokenizer();
      t.append('');
      t.append('слова');
      t.append('');
      const tokens = t.done();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.toString()).toBe('слова');
    });

    it('splits a word across three chunks', () => {
      const t = new Tokenizer();
      t.append('Пры');
      t.append('віта');
      t.append('нне');
      const tokens = t.done();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.toString()).toBe('Прывітанне');
    });

    it('handles a number split across chunks', () => {
      const t = new Tokenizer();
      t.append('12');
      t.append('34');
      const tokens = t.done();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.type).toBe(TokenType.NUMBER);
      expect(tokens[0]!.toString()).toBe('1234');
    });
  });
});

import { only, except, join } from '../src/tokens/filters.js';

describe('filters', () => {
  const tokens = Tokenizer.tokenize('Мама мыла раму!');

  it('only() returns only matching types', () => {
    const words = only(tokens, TokenType.WORD);
    expect(words.every(t => t.type === TokenType.WORD)).toBe(true);
    expect(words).toHaveLength(3);
  });

  it('except() excludes matching types', () => {
    const noSpace = except(tokens, TokenType.SPACE, TokenType.NEWLINE);
    expect(noSpace.every(t => t.type !== TokenType.SPACE)).toBe(true);
  });

  it('join() reconstructs original text', () => {
    expect(join(tokens)).toBe('Мама мыла раму!');
  });

  it('only() with empty args returns all', () => {
    expect(only(tokens)).toEqual(tokens);
  });

  it('except() with empty args returns all', () => {
    expect(except(tokens)).toEqual(tokens);
  });
});

describe('Tokenizer email and URL', () => {
  it('recognizes email addresses', () => {
    const tokens = Tokenizer.tokenize('пішыце на test@example.com');
    const email = tokens.find(t => t.type === TokenType.EMAIL);
    expect(email).toBeDefined();
    expect(email!.toString()).toBe('test@example.com');
  });

  it('recognizes URLs with https://', () => {
    const tokens = Tokenizer.tokenize('спасылка: https://example.com/test');
    const link = tokens.find(t => t.type === TokenType.LINK);
    expect(link).toBeDefined();
    expect(link!.toString()).toBe('https://example.com/test');
  });

  it('recognizes URLs with http://', () => {
    const tokens = Tokenizer.tokenize('http://test.com');
    const link = tokens.find(t => t.type === TokenType.LINK);
    expect(link).toBeDefined();
    expect(link!.toString()).toBe('http://test.com');
  });

  it('recognizes URLs with www.', () => {
    const tokens = Tokenizer.tokenize('www.example.com');
    const link = tokens.find(t => t.type === TokenType.LINK);
    expect(link).toBeDefined();
    expect(link!.toString()).toBe('www.example.com');
  });

  it('can disable email recognition', () => {
    const tz = new Tokenizer({ emails: false });
    const tokens = tz.append('test@example.com').done();
    expect(tokens.find(t => t.type === TokenType.EMAIL)).toBeUndefined();
  });

  it('can disable link recognition', () => {
    const tz = new Tokenizer({ links: false });
    const tokens = tz.append('https://test.com').done();
    expect(tokens.find(t => t.type === TokenType.LINK)).toBeUndefined();
  });

  it('can disable hashtags', () => {
    const tz = new Tokenizer({ hashtags: false });
    const tokens = tz.append('#test').done();
    expect(tokens.find(t => t.type === TokenType.HASHTAG)).toBeUndefined();
  });

  it('can disable mentions', () => {
    const tz = new Tokenizer({ mentions: false });
    const tokens = tz.append('@user').done();
    expect(tokens.find(t => t.type === TokenType.MENTION)).toBeUndefined();
  });
});
