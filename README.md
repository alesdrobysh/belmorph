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
- `parse(word: string): ParseResult[]` - Parse a word and return all possible analyses

### ParseResult

Represents a single morphological analysis.

Properties:
- `word: string` - The inflected word form
- `lemma: string` - The dictionary form
- `tags: Grammeme` - Grammatical properties

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

Available types: `Pos`, `Case`, `Gender`, `Num`, `Person`, `Tense`, `Mood`

## Building the Dictionary

The library requires a pre-built dictionary. To build it:

1. Ensure you have the `grammardb.sqlite3` database
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

build/
├── index.ts             # Dictionary builder
├── extract.ts           # Word extraction
├── analyze.ts           # Stem analysis
├── compress.ts          # DAWG building
├── predict.ts           # Prediction trie
└── export.ts            # File export

test/
├── analyzer.test.ts     # Analyzer tests
├── dawg.test.ts         # DAWG tests
└── tags.test.ts         # Tag system tests
```

## License

MIT License

## Credits

- Based on the original belaz morphological analyzer
- Uses the Belarusian grammar database
- Inspired by pymorphy2 (Python) and other morphological analyzers
