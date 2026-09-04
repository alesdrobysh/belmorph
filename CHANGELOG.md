# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.4] - 2026-09-04

### Changed
- Normalize typographic apostrophes to standard characters
- Update demo dictionary during the build process


## [1.1.3] - 2026-09-04

### Added
- Added support for the letter 'ё' to the DAWG alphabet.


## [1.1.2] - 2026-09-04

### Fixed
- Corrected numeral plural forms based on updated GrammarDB data.


## [1.1.1] - 2026-08-11

### Changed
- Updated documentation example to use the built-in `ParseResult.pluralize` method.

### Fixed
- Fixed decoding of GrammarDB paradigm metadata.


## [1.1.0] - 2026-07-09

### Added
- Added pluralization functionality for Belarusian nouns.
- Added a new tokenizer component.

### Changed
- Updated project dependencies and TypeScript configuration.


## [1.0.2] - 2026-06-17

### Changed
- Updated GrammarDB subproject dependency reference.
- Refactored tag decoding logic to improve maintainability.
- Enhanced test coverage for adverb comparisons.

### Removed
- Removed unreleased section and stale entries from changelog files.


## [1.0.1] - 2026-03-03

### Added
- Add automated release script
- Add changelog files

### Changed
- Implement dark mode and UI enhancements on the demo page

### Fixed
- Improve default dictionary directory resolution

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
