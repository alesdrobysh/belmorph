import { describe, it, expect, beforeAll } from 'vitest';
import { MorphAnalyzer } from '../src/analyzer.js';
import { loadDict } from '../src/node-loader.js';
import { resolve } from 'node:path';

let morph: MorphAnalyzer;

beforeAll(() => {
  morph = new MorphAnalyzer(loadDict(resolve(import.meta.dirname, '..', 'dict')));
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

describe('MorphAnalyzer.parse paradigm-level GrammarDB metadata', () => {
  it('parses сабака as an animate masculine common noun', () => {
    const dog = morph.parse('сабака').find(result => result.lemma === 'сабака');

    expect(dog).toBeDefined();
    expect(dog!.tags).toMatchObject({
      pos: 'N',
      properness: 'C',
      animacy: 'A',
      abbreviation: 'N',
      gender: 'M',
    });
  });

  it('parses чалавек with noun gender and animacy', () => {
    const person = morph.parse('чалавек').find(result => result.lemma === 'чалавек');

    expect(person).toBeDefined();
    expect(person!.tags).toMatchObject({
      pos: 'N',
      animacy: 'A',
      gender: 'M',
    });
  });

  it('parses proper nouns and abbreviations', () => {
    const minsk = morph.parse('мінск').find(result => result.lemma === 'мінск');
    const bsu = morph.parse('бду').find(result => result.lemma === 'бду');

    expect(minsk).toBeDefined();
    expect(minsk!.tags).toMatchObject({
      pos: 'N',
      properness: 'P',
      abbreviation: 'N',
    });
    expect(bsu).toBeDefined();
    expect(bsu!.tags).toMatchObject({
      pos: 'N',
      properness: 'P',
      abbreviation: 'K',
    });
  });

  it('parses verb transitivity, reflexivity and conjugation', () => {
    const write = morph.parse('напісаць').find(result => result.lemma === 'напісаць');
    const wash = morph.parse('мыцца').find(result => result.lemma === 'мыцца');

    expect(write).toBeDefined();
    expect(write!.tags).toMatchObject({
      pos: 'V',
      transitivity: 'D',
      reflexivity: 'N',
      conjugation: '1',
    });
    expect(wash).toBeDefined();
    expect(wash!.tags).toMatchObject({
      pos: 'V',
      transitivity: 'I',
      reflexivity: 'R',
      conjugation: '1',
    });
  });

  it('parses pronoun type and person', () => {
    const you = morph.parse('ты').find(result => result.tags.pos === 'S');

    expect(you).toBeDefined();
    expect(you!.tags).toMatchObject({
      pos: 'S',
      pronounType: 'P',
      person: '2',
    });
  });

  it('parses numeral and conjunction types', () => {
    const five = morph.parse('пяць').find(result => result.tags.pos === 'M');
    const conjunction = morph.parse('абы').find(result => result.tags.pos === 'C');

    expect(five).toBeDefined();
    expect(five!.tags).toMatchObject({ pos: 'M', numeralType: 'C' });
    expect(five!.tags).not.toHaveProperty('tense');
    expect(five!.tags).not.toHaveProperty('mood');
    expect(conjunction).toBeDefined();
    expect(conjunction!.tags).toMatchObject({ pos: 'C', conjunctionType: 'S' });
  });

  it('parses the cases governed by a preposition', () => {
    const without = morph.parse('без').find(result => result.tags.pos === 'I');

    expect(without).toBeDefined();
    expect(without!.tags).toMatchObject({
      pos: 'I',
      government: ['G'],
    });
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

  it('inflects adverb хутка to comparative хутчэй', () => {
    const adv = morph.parse('хутка')[0];
    const inflected = adv.inflect({ comparison: 'C' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('хутчэй');
  });

  it('inflects adverb хутка to superlative найхутчэй', () => {
    const adv = morph.parse('хутка')[0];
    const inflected = adv.inflect({ comparison: 'S' });
    expect(inflected).not.toBeNull();
    expect(inflected!.word).toBe('найхутчэй');
  });
});

describe('ParseResult.pluralize', () => {
  it('agrees горад with 1 → nominative singular', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(1)!.word).toBe('горад');
  });

  it('agrees горад with 2, 3, 4 → special nominative plural', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(2)!.word).toBe('гарады');
    expect(city.pluralize(3)!.word).toBe('гарады');
    expect(city.pluralize(4)!.word).toBe('гарады');
  });

  it('agrees горад with 5+ → genitive plural', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(5)!.word).toBe('гарадоў');
    expect(city.pluralize(25)!.word).toBe('гарадоў');
  });

  it('agrees горад with 0 → genitive plural', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(0)!.word).toBe('гарадоў');
  });

  it('handles the 11-14 exception → genitive plural', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(11)!.word).toBe('гарадоў');
    expect(city.pluralize(12)!.word).toBe('гарадоў');
    expect(city.pluralize(13)!.word).toBe('гарадоў');
    expect(city.pluralize(14)!.word).toBe('гарадоў');
  });

  it('agrees горад with 21 → nominative singular, 22-24 → nominative plural', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(21)!.word).toBe('горад');
    expect(city.pluralize(22)!.word).toBe('гарады');
    expect(city.pluralize(24)!.word).toBe('гарады');
  });

  it('agrees negative counts the same as their absolute value', () => {
    const city = morph.parse('горад')[0];
    expect(city.pluralize(-1)!.word).toBe('горад');
    expect(city.pluralize(-2)!.word).toBe('гарады');
    expect(city.pluralize(-5)!.word).toBe('гарадоў');
  });

  it('works for feminine nouns (кніга)', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(1)!.word).toBe('кніга');
    expect(book.pluralize(2)!.word).toBe('кнігі');
    expect(book.pluralize(5)!.word).toBe('кніг');
  });

  it('uses lexical plural forms for irregular and stem-changing nouns', () => {
    const item = morph.parse('тавар')[0];
    const horse = morph.parse('конь')[0];
    expect(item.pluralize(3)!.word).toBe('тавары');
    expect(horse.pluralize(4)!.word).toBe('кані');
  });

  it('uses GrammarDB numeral exceptions', () => {
    expect(morph.parse('сястра')[0].pluralize(2)!.word).toBe('сястры');
    expect(morph.parse('акно')[0].pluralize(3)!.word).toBe('акны');
    expect(morph.parse('гняздо')[0].pluralize(4)!.word).toBe('гнязды');
  });

  it('defaults to nominative regardless of the starting form\'s own case', () => {
    const accForm = morph.parse('кнігу')[0]; // accusative singular
    expect(accForm.pluralize(1)!.word).toBe('кніга');
    expect(accForm.pluralize(2)!.word).toBe('кнігі');
    expect(accForm.pluralize(5)!.word).toBe('кніг');
  });

  it('accepts an explicit accusative targetCase', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(1, 'A')!.word).toBe('кнігу'); // accusative singular
    expect(book.pluralize(2, 'A')!.word).toBe('кнігі'); // special plural form
    expect(book.pluralize(5, 'A')!.word).toBe('кніг'); // genitive plural
  });

  it('accepts an explicit dative targetCase (oblique government)', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(1, 'D')!.word).toBe('кнізе'); // dative singular
    expect(book.pluralize(2, 'D')!.word).toBe('кнігам'); // dative plural
    expect(book.pluralize(5, 'D')!.word).toBe('кнігам'); // dative plural
    expect(book.pluralize(11, 'D')!.word).toBe('кнігам'); // dative plural
  });

  it('accepts an explicit instrumental targetCase', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(1, 'I')!.word).toBe('кнігай');
    expect(book.pluralize(5, 'I')!.word).toBe('кнігамі');
  });

  it('accepts an explicit genitive targetCase (e.g. governed by a preposition)', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(1, 'G')!.word).toBe('кнігі'); // genitive singular
    expect(book.pluralize(5, 'G')!.word).toBe('кніг'); // genitive plural
  });

  it('accepts full case names for targetCase', () => {
    const book = morph.parse('кніга')[0];
    expect(book.pluralize(5, 'dative')!.word).toBe('кнігам');
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
