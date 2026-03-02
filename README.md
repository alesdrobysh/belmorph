# belmorph

[Беларуская](README.be.md)

**Zero-dependency Belarusian morphological analyzer**

A fast, lightweight library for analyzing Belarusian words and their morphological properties.

[Demo](https://alesdrobysh.github.io/belmorph/)

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

### Node.js — filesystem (bundled dictionary)

```typescript
import { MorphAnalyzer } from 'belmorph';
import { loadDict } from 'belmorph/node';

const morph = new MorphAnalyzer(loadDict()); // uses bundled dict/
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

### Browser / Deno / Node.js — HTTP

```typescript
import { MorphAnalyzer } from 'belmorph';

// Serve the dict/ folder as static files and point to it:
const morph = await MorphAnalyzer.init('/dict/');
// or from a CDN:
const morph = await MorphAnalyzer.init('https://cdn.example.com/dict/');

const results = morph.parse('горад');
```

When a word is not found in the dictionary, the analyzer falls back to suffix-based prediction — those results have `predicted: true` and may be less accurate.

## API

### Loading

| Method | Environment | Description |
|--------|-------------|-------------|
| `new MorphAnalyzer(dict)` | all | Construct from a pre-loaded `DictData` object |
| `MorphAnalyzer.init(baseUrl?)` | all | Async factory — fetches and decompresses dict files over HTTP. Default base URL: `'/dict/'` |
| `loadDict(dir?)` from `belmorph/node` | Node.js only | Synchronous filesystem load. Defaults to the bundled `dict/` |

### ParseResult

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
