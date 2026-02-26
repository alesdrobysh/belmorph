// Atomic grammeme types — strict unions
export type Pos = 'N' | 'A' | 'V' | 'E' | 'P' | 'C' | 'I' | 'Z';
export type Case = 'N' | 'G' | 'D' | 'A' | 'I' | 'L' | 'H';
export type Gender = 'M' | 'F' | 'N';
export type Num = 'S' | 'P';
export type Person = '1' | '2' | '3';
export type Tense = 'R' | 'P' | 'F';
export type Mood = 'I' | 'M';
export type Aspect = 'PF' | 'IP';
export type Voice = 'A' | 'P';

export interface Grammeme {
  pos?: Pos;
  case?: Case;
  gender?: Gender;
  number?: Num;
  person?: Person;
  tense?: Tense;
  mood?: Mood;
}

// Valid sets for runtime checking
const CASES = new Set<string>(['N', 'G', 'D', 'A', 'I', 'L', 'H']);
const GENDERS = new Set<string>(['M', 'F', 'N']);
const PERSONS = new Set<string>(['1', '2', '3']);

/**
 * Decode a form tag string (e.g. "MNS", "R1S", "PFS") into a Grammeme.
 *
 * Form tag patterns from the DB:
 * - Nominal: [Case][Number] e.g. "NS", "GP", or [Gender][Case][Number] e.g. "MNS", "FGP"
 * - Verb present/future: R|F + Person + Number e.g. "R1S", "F3P"
 * - Verb past: P + Gender|X + S|P e.g. "PMS", "PFS", "PNS", "PXP"
 * - Verb gerund: RG (present gerund)
 * - Imperative: I + Person + Number e.g. "I2S", "I2P"
 * - Participle adjective forms: 0|1 + optional adj endings
 * - Special: "0" (infinitive), "C" (comparative), "" (base), "P" (participle prefix?),
 *   "R" (short?), "S" (short?), "VS" (verbal noun?)
 */
export function decodeFormTag(tag: string): Grammeme {
  const g: Grammeme = {};

  if (tag === '' || tag === '0') {
    // base form / infinitive — no extra grammemes
    return g;
  }

  if (tag === 'C') {
    // comparative
    return g;
  }

  // Verb present/future tense: R1S, R2P, F3S, etc.
  if ((tag[0] === 'R' || tag[0] === 'F') && tag.length === 3 && PERSONS.has(tag[1])) {
    g.tense = tag[0] as Tense;
    g.person = tag[1] as Person;
    g.number = tag[2] as Num;
    return g;
  }

  // Gerund: RG
  if (tag === 'RG') {
    return g;
  }

  // Imperative: I2S, I2P
  if (tag[0] === 'I' && tag.length === 3 && PERSONS.has(tag[1])) {
    g.mood = 'M';
    g.person = tag[1] as Person;
    g.number = tag[2] as Num;
    return g;
  }

  // Past tense: PMS, PFS, PNS, PXP, PG (past gerund)
  if (tag[0] === 'P' && tag.length === 3 && (GENDERS.has(tag[1]) || tag[1] === 'X')) {
    g.tense = 'P';
    if (GENDERS.has(tag[1])) {
      g.gender = tag[1] as Gender;
    }
    g.number = tag[2] as Num;
    return g;
  }
  if (tag === 'PG') {
    g.tense = 'P';
    return g;
  }

  // Participial/adjective-like forms with leading '0' or '1':
  // 0NS, 0GP, 1, etc.
  if (tag[0] === '0' && tag.length > 1) {
    // strip the '0' prefix and decode the rest as nominal
    return decodeNominalTag(tag.slice(1));
  }
  if (tag === '1') {
    // short participle base form
    return g;
  }

  // Special short tags
  if (tag === 'P' || tag === 'R' || tag === 'S' || tag === 'VS') {
    return g;
  }

  // Nominal forms: with gender prefix (MNS, FGP, NAP) or without (NS, GP, AP)
  return decodeNominalTag(tag);
}

function decodeNominalTag(tag: string): Grammeme {
  const g: Grammeme = {};

  if (tag.length === 3 && GENDERS.has(tag[0])) {
    // Gender + Case + Number: MNS, FGP, etc.
    g.gender = tag[0] as Gender;
    if (CASES.has(tag[1])) g.case = tag[1] as Case;
    g.number = tag[2] as Num;
    return g;
  }

  if (tag.length === 2 && CASES.has(tag[0])) {
    // Case + Number: NS, GP, etc.
    g.case = tag[0] as Case;
    g.number = tag[1] as Num;
    return g;
  }

  // Vocative: MHS, FHS, NHS
  if (tag.length === 3 && GENDERS.has(tag[0]) && tag[1] === 'H') {
    g.gender = tag[0] as Gender;
    g.case = 'H';
    g.number = tag[2] as Num;
    return g;
  }

  // Plural-only nominal forms (PAP, PDP, PGP, PIP, PLP, PNP)
  if (tag.length === 3 && tag[0] === 'P' && CASES.has(tag[1])) {
    g.number = 'P';
    g.case = tag[1] as Case;
    return g;
  }

  return g;
}

/**
 * Decode the paradigm tag prefix to a POS.
 * N... = noun, A... = adjective, V... = verb, E = adverb,
 * C... = conjunction, I = interjection, M... = pronoun, Z = particle
 */
export function posFromParadigmTag(tag: string): Pos | undefined {
  if (!tag) return undefined;
  const ch = tag[0];
  switch (ch) {
    case 'N': return 'N';
    case 'A': return 'A';
    case 'V': return 'V';
    case 'E': return 'E';
    case 'C': return 'C';
    case 'I': return 'I';
    case 'M': return 'P'; // M-prefix paradigm tags → pronoun
    case 'Z': return 'Z';
    default: return undefined;
  }
}

/**
 * Check if a grammeme matches a target (partial match).
 * Every field set in target must match the corresponding field in grammeme.
 */
export function matchesGrammeme(grammeme: Grammeme, target: Partial<Grammeme>): boolean {
  for (const key of Object.keys(target) as (keyof Grammeme)[]) {
    if (target[key] !== undefined && grammeme[key] !== target[key]) {
      return false;
    }
  }
  return true;
}
