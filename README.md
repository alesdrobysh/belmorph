# belmorph

[Беларуская](README.be.md)

**Zero-dependency Belarusian morphological analyzer**

A fast, lightweight library for analyzing Belarusian words and their morphological properties.

## Features

- **Morphological analysis**: Parse words to determine part of speech, case, gender, number, tense, aspect, animacy, comparison degree, and other grammatical properties
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

// Get all forms
const lexeme = results[0].lexeme;
console.log(lexeme.map(r => r.word));
```

When a word is not found in the dictionary, the analyzer falls back to suffix-based prediction — those results have `predicted: true` and may be less accurate.

## API

`MorphAnalyzer.parse(word)` returns an array of `ParseResult` objects. Each result has:

- `word` — the inflected word form
- `lemma` — the dictionary form
- `tags` — grammatical properties (`Grammeme` interface, see `src/tags.ts`)
- `predicted` — whether the analysis was predicted
- `inflect(target)` — returns the form matching the given grammemes, or `null`
- `lexeme` — all forms of the word

Grammeme values follow [GrammarDB](https://github.com/Belarus/GrammarDB) codes. Both short codes (`'I'`) and full English names (`'instrumental'`) are accepted by `inflect()`.

## Building the Dictionary

The library requires a pre-built dictionary. To build it:

```bash
git submodule update --init
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
