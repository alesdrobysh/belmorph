// Re-export runtime tag types for builder use
export { decodeFormTag, posFromParadigmTag, decodeParadigmTag } from '../src/tags.js';
export type {
  Grammeme,
  Pos,
  Case,
  Gender,
  Num,
  Person,
  Tense,
  Mood,
  Aspect,
  Voice,
  AspectName,
  VoiceName,
  Properness,
  Abbreviation,
  Transitivity,
  Reflexivity,
  Conjugation,
  PronounType,
  NumeralType,
  ConjunctionType,
} from '../src/tags.js';
