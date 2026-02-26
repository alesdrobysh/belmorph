export { MorphAnalyzer } from './analyzer.js';
export { ParseResult } from './parse-result.js';
export type { Grammeme, Pos, Case, Gender, Num, Person, Tense, Mood } from './tags.js';
export type { GrammemeInput, CaseName, GenderName, NumberName, PosName, TenseName, MoodName } from './tags.js';
export { decodeFormTag, posFromParadigmTag, matchesGrammeme, normalizeGrammeme } from './tags.js';
