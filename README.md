# belaz

**Zero-dependency Belarusian morphological analyzer**

A fast, lightweight library for analyzing Belarusian words and their morphological properties.

## Features

- **Morphological analysis**: Parse words to determine part of speech, case, gender, number, tense, and other grammatical properties
- **Inflection**: Generate different grammatical forms of words
- **Lexeme generation**: Get all possible forms of a word
- **Zero dependencies**: No external runtime dependencies
- **TypeScript support**: Full type definitions included
- **Efficient storage**: Uses DAWG (Directed Acyclic Word Graph) for fast lookups

## Installation

```bash
npm install belaz
```

## Quick Start

```typescript
import { MorphAnalyzer } from 'belaz';

const morph = new MorphAnalyzer();
const results = morph.parse('горад');

console.log(results[0].lemma); // 'горад'
console.log(results[0].tags.pos); // 'N' (noun)

// Inflect to different forms
const instrumentalPlural = results[0].inflect({ case: 'I', number: 'P' });
console.log(instrumentalPlural?.word); // 'гарадамі'

// Get all forms
const lexeme = results[0].lexeme;
console.log(lexeme.map(r => r.word));
```

## API

### MorphAnalyzer

Main class for morphological analysis.

```typescript
const morph = new MorphAnalyzer(dictPath?: string);
```

- `parse(word: string): ParseResult[]` - Parse a word and return all possible analyses

### ParseResult

Represents a single morphological analysis.

Properties:
- `word: string` - The inflected word form
- `lemma: string` - The dictionary form
- `tags: Grammeme` - Grammatical properties
- `predicted: boolean` - Whether the analysis was predicted (unknown word)

Methods:
- `inflect(target: Partial<Grammeme>): ParseResult | null` - Inflect to a specific form
- `get lexeme(): ParseResult[]` - Get all forms of this word

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

| Value | Meaning |
|-------|---------|
| `'N'` | Nominative |
| `'G'` | Genitive |
| `'D'` | Dative |
| `'A'` | Accusative |
| `'I'` | Instrumental |
| `'L'` | Locative |
| `'H'` | Vocative |

#### Gender

| Value | Meaning |
|-------|---------|
| `'M'` | Masculine |
| `'F'` | Feminine |
| `'N'` | Neuter |

#### Num

| Value | Meaning |
|-------|---------|
| `'S'` | Singular |
| `'P'` | Plural |

#### Person

| Value | Meaning |
|-------|---------|
| `'1'` | First person |
| `'2'` | Second person |
| `'3'` | Third person |

#### Tense

| Value | Meaning |
|-------|---------|
| `'R'` | Present |
| `'P'` | Past |
| `'F'` | Future |

#### Mood

| Value | Meaning |
|-------|---------|
| `'I'` | Indicative |
| `'M'` | Imperative |

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
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

## Project Structure

```
src/
├── analyzer.ts          # Main MorphAnalyzer class
├── parse-result.ts      # ParseResult class
├── tags.ts              # Grammatical tag system
├── data-loader.ts       # Dictionary loading
├── dawg/                # DAWG implementation
└── index.ts             # Main exports

builder/
├── index.ts             # Dictionary builder entry point
├── extract.ts           # Word extraction from GrammarDB XML
├── analyze.ts           # Stem analysis
├── compress.ts          # DAWG building
├── predict.ts           # Prediction trie
├── tag-map.ts           # GrammarDB tag mapping
└── export.ts            # File export

dict/
├── dict.dawg.gz         # Compressed word DAWG
├── predict.dawg.gz      # Compressed prediction DAWG
├── paradigms.bin.gz     # Compressed paradigm table
└── meta.json            # Dictionary metadata

test/
├── analyzer.test.ts     # Analyzer tests
├── builder.test.ts      # Builder tests
├── predictor.test.ts    # Predictor tests
├── dawg.test.ts         # DAWG tests
└── tags.test.ts         # Tag system tests
```

## License

MIT License

## Credits

- Dictionary data from [GrammarDB](https://github.com/Belarus/GrammarDB) (Aparatčyk project)
- Inspired by [pymorphy2](https://github.com/pymorphy2/pymorphy2) and other morphological analyzers
