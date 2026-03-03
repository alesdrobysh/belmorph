# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-03-03

### Added
- Add automated release script
- Add changelog files

### Changed
- Implement dark mode and UI enhancements on the demo page

### Fixed
- Improve default dictionary directory resolution


## [Unreleased]

### Added
- `loadDictAsync` function for web-compatible dictionary loading via the Fetch API
- `belmorph/node` package export (`node-loader.ts`) for Node.js-specific dictionary loading
- Interactive Svelte demo application deployed to GitHub Pages
- Graceful handling of browser-decompressed gzip responses

### Changed
- `MorphAnalyzer` now accepts pre-loaded `DictData` instead of loading the dictionary internally

## [1.0.0] - 2026-03-02

### Added
- `MorphAnalyzer` class with `parse`, `inflect`, and `lexeme` methods
- DAWG-based compressed dictionary for fast word lookups (dict.dawg.gz, paradigms.bin.gz)
- Morphological prediction for unknown words using a suffix-based DAWG; predicted results are marked with `predicted: true`
- Support for human-readable grammeme names in `inflect` (e.g. `'nominative'`, `'plural'`) in addition to short codes
- Animacy grammeme (`A` animate, `I` inanimate) decoded from paradigm tags
- Comparison degree (`P` positive, `C` comparative, `S` superlative) for adjectives and adverbs
- Verb aspect (`imperfective`/`perfective`) and voice (`active`/`passive`) decoded from paradigm tags
- Dictionary sourced from [GrammarDB](https://github.com/Belarus/GrammarDB) XML files
- Dual license: MIT for code, CC-BY-SA-4.0 for dictionary data
