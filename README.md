# belmorph

[Беларуская](README.be.md)

**Zero-dependency Belarusian morphological analyzer**

A fast, lightweight library for analyzing Belarusian words and their morphological properties.

## Features

- **Morphological analysis**: Parse words to determine part of speech, case, gender, number, tense, and other grammatical properties
- **Inflection**: Generate different grammatical forms of words
- **Lexeme generation**: Get all possible forms of a word
- **Morphological prediction**: Unknown words are analyzed using suffix-based patterns
- **Zero dependencies**: No external runtime dependencies
- **TypeScript support**: Full type definitions included
- **Efficient storage**: Uses DAWG (Directed Acyclic Word Graph) for fast lookups
- **Browser compatible**: Works in Node.js, browsers, and Deno — no native dependencies
- Dictionary covers 6,574 inflection paradigms derived from GrammarDB

## Installation

```bash
npm install belmorph
```

## Quick Start

```typescript
import { MorphAnalyzer } from 'belmorph';

const morph = new MorphAnalyzer();
const results = morph.parse('горад');

console.log(results[0].lemma);    // 'горад'
console.log(results[0].tags.pos); // 'N' (noun)

// Inflect to different forms
results[0].inflect({ case: 'I', number: 'P' })?.word; // 'гарадамі'

// Full names and short codes are interchangeable
results[0].inflect({ case: 'instrumental', number: 'plural' })?.word; // 'гарадамі'
results[0].inflect({ case: 'I', number: 'plural' })?.word;            // same result

// Get all forms
const lexeme = results[0].lexeme;
console.log(lexeme.map(r => r.word));
```

### Verb example

```typescript
const results = morph.parse('пісаць');
console.log(results[0].lemma);    // 'пісаць'
console.log(results[0].tags.pos); // 'V' (verb)
```

### Adjective example

```typescript
const results = morph.parse('вялікі');
console.log(results[0].lemma);    // 'вялікі'
console.log(results[0].tags.pos); // 'A' (adjective)
```

## API

### MorphAnalyzer

Main class for morphological analysis.

```typescript
const morph = new MorphAnalyzer(dictPath?: string);
```

The `dictPath` parameter is optional and defaults to the bundled `dict/` directory. Callers normally don't need to pass it.

- `parse(word: string): ParseResult[]` — Parse a word and return all possible analyses

### ParseResult

Represents a single morphological analysis.

Properties:
- `word: string` — The inflected word form
- `lemma: string` — The dictionary form
- `tags: Grammeme` — Grammatical properties
- `predicted: boolean` — Whether the analysis was predicted (unknown word)

When a word is not found in the dictionary, the analyzer falls back to suffix-based prediction. Those results have `predicted: true` and may be less accurate:

```typescript
if (results[0].predicted) {
  // Analysis is based on suffix patterns, may be less accurate
}
```

Methods:
- `inflect(target: Partial<GrammemeInput>): ParseResult | null` — Inflect to a specific form
- `get lexeme(): ParseResult[]` — Get all forms of this word

### Grammeme

Interface for grammatical properties:

```typescript
interface Grammeme {
  pos?: Pos;        // Part of speech
  case?: Case;      // Case
  gender?: Gender;  // Gender
  number?: Num;     // Number
  person?: Person;  // Person
  tense?: Tense;    // Tense
  mood?: Mood;      // Mood
}
```

The `inflect()` method accepts both short codes and full English names for case, gender, number, tense, and mood (see tables below).

#### Pos

| Value | Meaning |
|-------|---------|
| `'N'` | Noun |
| `'A'` | Adjective |
| `'V'` | Verb |
| `'E'` | Adverb |
| `'P'` | Pronoun |
| `'C'` | Conjunction |
| `'I'` | Interjection |
| `'Z'` | Particle |

#### Case

| Value | Full name | Meaning |
|-------|-----------|---------|
| `'N'` | `'nominative'` | Nominative |
| `'G'` | `'genitive'` | Genitive |
| `'D'` | `'dative'` | Dative |
| `'A'` | `'accusative'` | Accusative |
| `'I'` | `'instrumental'` | Instrumental |
| `'L'` | `'locative'` | Locative |
| `'V'` | `'vocative'` | Vocative |

#### Gender

| Value | Full name | Meaning |
|-------|-----------|---------|
| `'M'` | `'masculine'` | Masculine |
| `'F'` | `'feminine'` | Feminine |
| `'N'` | `'neuter'` | Neuter |

#### Num

| Value | Full name | Meaning |
|-------|-----------|---------|
| `'S'` | `'singular'` | Singular |
| `'P'` | `'plural'` | Plural |

#### Person

| Value | Meaning |
|-------|---------|
| `'1'` | First person |
| `'2'` | Second person |
| `'3'` | Third person |

#### Tense

| Value | Full name | Meaning |
|-------|-----------|---------|
| `'R'` | `'present'` | Present |
| `'P'` | `'past'` | Past |
| `'F'` | `'future'` | Future |

#### Mood

| Value | Full name | Meaning |
|-------|-----------|---------|
| `'I'` | `'indicative'` | Indicative |
| `'M'` | `'imperative'` | Imperative |

## Building the Dictionary

The library requires a pre-built dictionary. To build it:

1. Ensure the `GrammarDB` submodule is initialized:

```bash
git submodule update --init
```

2. Run the dictionary builder:

```bash
npm run build:dict
```

This will create the necessary dictionary files in the `dict/` directory.

## Testing

```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## License

This project is dual-licensed:
- **Source Code**: [MIT License](LICENSE)
- **Dictionary Data**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (derived from GrammarDB)

See the [LICENSE](LICENSE) file for full details.

## Credits

- Dictionary data from [GrammarDB](https://github.com/Belarus/GrammarDB) by Aleś Bułojčyk and contributors.
- Inspired by [pymorphy2](https://github.com/pymorphy2/pymorphy2) and other morphological analyzers.
