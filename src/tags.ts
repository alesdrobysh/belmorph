// Atomic grammeme types — strict unions
// Following GrammarDB codes
export type Pos =
  | "N"
  | "M"
  | "S"
  | "A"
  | "V"
  | "P"
  | "R"
  | "C"
  | "I"
  | "E"
  | "Y"
  | "Z"
  | "W"
  | "F";
export type Case = "N" | "G" | "D" | "A" | "I" | "L" | "V";
export type Gender = "M" | "F" | "N" | "C"; // C=common gender (агульны род)
export type Num = "S" | "P";
export type Person = "1" | "2" | "3" | "0"; // 0=impersonal (безасабовая форма)
export type Tense = "R" | "P" | "F" | "Q"; // Q=pluperfect (перадпрошлы час)
export type Mood = "I" | "M";
export type Aspect = "P" | "M"; // P=perfective, M=imperfective (GrammarDB codes)
export type Voice = "A" | "P"; // A=active, P=passive
export type Animacy = "A" | "I"; // A=animate, I=inanimate (адушаўлёнасць)
export type Comparison = "P" | "C" | "S"; // P=positive, C=comparative, S=superlative

// Full-name grammeme types for better readability
export type CaseName =
  | "nominative"
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "locative"
  | "vocative";
export type GenderName = "masculine" | "feminine" | "neuter" | "common";
export type NumberName = "singular" | "plural";
export type PosName =
  | "noun"
  | "numeral"
  | "pronoun"
  | "adjective"
  | "verb"
  | "participle"
  | "adverb"
  | "conjunction"
  | "preposition"
  | "particle"
  | "interjection"
  | "parenthetical"
  | "predicative"
  | "word-part";
export type TenseName = "present" | "past" | "future" | "pluperfect";
export type MoodName = "indicative" | "imperative";
export type AspectName = "perfective" | "imperfective";
export type VoiceName = "active" | "passive";
export type AnimacyName = "animate" | "inanimate";
export type ComparisonName = "positive" | "comparative" | "superlative";

export interface Grammeme {
  pos?: Pos;
  case?: Case;
  gender?: Gender;
  number?: Num;
  person?: Person;
  tense?: Tense;
  mood?: Mood;
  aspect?: Aspect;
  voice?: Voice;
  animacy?: Animacy;
  comparison?: Comparison;
}

export interface GrammemeInput {
  pos?: Pos | PosName;
  case?: Case | CaseName;
  gender?: Gender | GenderName;
  number?: Num | NumberName;
  person?: Person;
  tense?: Tense | TenseName;
  mood?: Mood | MoodName;
  aspect?: Aspect | AspectName;
  voice?: Voice | VoiceName;
  animacy?: Animacy | AnimacyName;
  comparison?: Comparison | ComparisonName;
}

// Valid sets for runtime checking
const CASES = new Set<string>(["N", "G", "D", "A", "I", "L", "V"]);
const GENDERS = new Set<string>(["M", "F", "N", "C"]); // C=common gender
const PERSONS = new Set<string>(["1", "2", "3", "0"]); // 0=impersonal

// Normalization maps for full-name grammemes
const CASE_MAP: Record<CaseName, Case> = {
  nominative: "N",
  genitive: "G",
  dative: "D",
  accusative: "A",
  instrumental: "I",
  locative: "L",
  vocative: "V",
};

const GENDER_MAP: Record<GenderName, Gender> = {
  masculine: "M",
  feminine: "F",
  neuter: "N",
  common: "C",
};

const NUMBER_MAP: Record<NumberName, Num> = {
  singular: "S",
  plural: "P",
};

const POS_MAP: Record<PosName, Pos> = {
  noun: "N",
  numeral: "M",
  pronoun: "S",
  adjective: "A",
  verb: "V",
  participle: "P",
  adverb: "R",
  conjunction: "C",
  preposition: "I",
  particle: "E",
  interjection: "Y",
  parenthetical: "Z",
  predicative: "W",
  "word-part": "F",
};

const TENSE_MAP: Record<TenseName, Tense> = {
  present: "R",
  past: "P",
  future: "F",
  pluperfect: "Q",
};

const MOOD_MAP: Record<MoodName, Mood> = {
  indicative: "I",
  imperative: "M",
};

const ASPECT_MAP: Record<AspectName, Aspect> = {
  perfective: "P",
  imperfective: "M",
};

const VOICE_MAP: Record<VoiceName, Voice> = {
  active: "A",
  passive: "P",
};

const ANIMACY_MAP: Record<AnimacyName, Animacy> = {
  animate: "A",
  inanimate: "I",
};

const COMPARISON_MAP: Record<ComparisonName, Comparison> = {
  positive: "P",
  comparative: "C",
  superlative: "S",
};

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

  if (tag === "" || tag === "0") {
    // base form / infinitive — no extra grammemes
    return g;
  }

  if (tag === "C") {
    // comparative degree form (e.g. хутчэй)
    g.comparison = "C";
    return g;
  }

  // Verb present/future tense: R1S, R2P, F3S, etc.
  if (
    (tag[0] === "R" || tag[0] === "F") &&
    tag.length === 3 &&
    PERSONS.has(tag[1])
  ) {
    g.tense = tag[0] as Tense;
    g.person = tag[1] as Person;
    g.number = tag[2] as Num;
    g.mood = "I";
    return g;
  }

  // Gerund: RG
  if (tag === "RG") {
    return g;
  }

  // Imperative: I2S, I2P
  if (tag[0] === "I" && tag.length === 3 && PERSONS.has(tag[1])) {
    g.mood = "M";
    g.person = tag[1] as Person;
    g.number = tag[2] as Num;
    return g;
  }

  // Past tense: PMS, PFS, PNS, PXP, PG (past gerund)
  if (
    tag[0] === "P" &&
    tag.length === 3 &&
    (GENDERS.has(tag[1]) || tag[1] === "X")
  ) {
    g.tense = "P";
    g.mood = "I";
    if (GENDERS.has(tag[1])) {
      g.gender = tag[1] as Gender;
    }
    g.number = tag[2] as Num;
    return g;
  }
  if (tag === "PG") {
    g.tense = "P";
    g.mood = "I";
    return g;
  }

  // Participial/adjective-like forms with leading '0' or '1':
  // 0NS, 0GP, 1, etc.
  if (tag[0] === "0" && tag.length > 1) {
    // strip the '0' prefix and decode the rest as nominal
    return decodeNominalTag(tag.slice(1));
  }
  if (tag === "1") {
    // short participle base form
    return g;
  }

  // Special short tags (indeclinable/base forms with no further grammeme info)
  if (tag === "P" || tag === "R" || tag === "S") {
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

  // Plural-only nominal forms (PAP, PDP, PGP, PIP, PLP, PNP)
  if (tag.length === 3 && tag[0] === "P" && CASES.has(tag[1])) {
    g.number = "P";
    g.case = tag[1] as Case;
    return g;
  }

  return g;
}

/**
 * Decode the paradigm tag prefix to a POS.
 * Uses GrammarDB's own paradigm tag letters directly — no remapping.
 * N=noun, M=numeral, S=pronoun, A=adjective, V=verb, P=participle,
 * R=adverb, C=conjunction, I=preposition, E=particle, Y=interjection,
 * Z=parenthetical, W=predicative, F=word-part
 */
export function posFromParadigmTag(tag: string): Pos | undefined {
  if (!tag) return undefined;
  const ch = tag[0];
  return "NMSAVPRCIEYZWF".includes(ch) ? (ch as Pos) : undefined;
}

/**
 * Decode a paradigm tag into paradigm-level grammemes (pos, aspect, voice).
 * Uses GrammarDB positional encoding from BelarusianTags.java.
 *
 * - All POS: position 0 → pos
 * - Verb V[transitivity][aspect][reflexivity][conjugation]: position 2 → aspect (P/M)
 * - Participle P[voice][tense][aspect]: position 1 → voice (A/P), position 3 → aspect (P/M)
 */
export function decodeParadigmTag(tag: string): Grammeme {
  const g: Grammeme = {};
  if (!tag) return g;

  const pos = posFromParadigmTag(tag);
  if (pos) g.pos = pos;

  // Verb: V[+?][transitivity][aspect][reflexivity][conjugation]
  // '+' at position 1 is a "new word" marker — aspect shifts one position right
  if (pos === "V") {
    const aspIdx = tag[1] === "+" ? 3 : 2;
    if (tag.length > aspIdx) {
      const asp = tag[aspIdx];
      if (asp === "P" || asp === "M") g.aspect = asp;
    }
  }

  // Participle: P[voice][tense][aspect]
  if (pos === "P" && tag.length > 1) {
    const voice = tag[1];
    if (voice === "A" || voice === "P") g.voice = voice as Voice;
    if (tag.length > 3) {
      const asp = tag[3];
      if (asp === "P" || asp === "M") g.aspect = asp;
    }
  }

  // Noun: N[category][class][animacy][gender][...]
  // Animacy is encoded at position 3 (0-indexed)
  if (pos === "N" && tag.length > 3) {
    const anim = tag[3];
    if (anim === "A" || anim === "I") g.animacy = anim;
  }

  // Adjective: A[type][class][comparison]
  // Comparison degree is encoded at position 2 (0-indexed)
  if (pos === "A" && tag.length > 2) {
    const comp = tag[2];
    if (comp === "P" || comp === "C" || comp === "S") g.comparison = comp;
  }

  // Adverb: R[comparison]
  // Comparison degree is encoded at position 1 (0-indexed)
  if (pos === "R" && tag.length > 1) {
    const comp = tag[1];
    if (comp === "P" || comp === "C" || comp === "S") g.comparison = comp;
  }

  return g;
}

/**
 * Check if a grammeme matches a target (partial match).
 * Every field set in target must match the corresponding field in grammeme.
 */
export function matchesGrammeme(
  grammeme: Grammeme,
  target: Partial<Grammeme>,
): boolean {
  for (const key of Object.keys(target) as (keyof Grammeme)[]) {
    if (target[key] !== undefined && grammeme[key] !== target[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Normalize GrammemeInput to Grammeme by converting full names to short codes.
 */
export function normalizeGrammeme(input: GrammemeInput): Partial<Grammeme> {
  const result: Partial<Grammeme> = {};

  if (input.pos !== undefined) {
    result.pos =
      typeof input.pos === "string" && input.pos in POS_MAP
        ? POS_MAP[input.pos as PosName]
        : (input.pos as Pos);
  }

  if (input.case !== undefined) {
    result.case =
      typeof input.case === "string" && input.case in CASE_MAP
        ? CASE_MAP[input.case as CaseName]
        : (input.case as Case);
  }

  if (input.gender !== undefined) {
    result.gender =
      typeof input.gender === "string" && input.gender in GENDER_MAP
        ? GENDER_MAP[input.gender as GenderName]
        : (input.gender as Gender);
  }

  if (input.number !== undefined) {
    result.number =
      typeof input.number === "string" && input.number in NUMBER_MAP
        ? NUMBER_MAP[input.number as NumberName]
        : (input.number as Num);
  }

  if (input.person !== undefined) {
    result.person = input.person;
  }

  if (input.tense !== undefined) {
    result.tense =
      typeof input.tense === "string" && input.tense in TENSE_MAP
        ? TENSE_MAP[input.tense as TenseName]
        : (input.tense as Tense);
  }

  if (input.mood !== undefined) {
    result.mood =
      typeof input.mood === "string" && input.mood in MOOD_MAP
        ? MOOD_MAP[input.mood as MoodName]
        : (input.mood as Mood);
  }

  if (input.aspect !== undefined) {
    result.aspect =
      typeof input.aspect === "string" && input.aspect in ASPECT_MAP
        ? ASPECT_MAP[input.aspect as AspectName]
        : (input.aspect as Aspect);
  }

  if (input.voice !== undefined) {
    result.voice =
      typeof input.voice === "string" && input.voice in VOICE_MAP
        ? VOICE_MAP[input.voice as VoiceName]
        : (input.voice as Voice);
  }

  if (input.animacy !== undefined) {
    result.animacy =
      typeof input.animacy === "string" && input.animacy in ANIMACY_MAP
        ? ANIMACY_MAP[input.animacy as AnimacyName]
        : (input.animacy as Animacy);
  }

  if (input.comparison !== undefined) {
    result.comparison =
      typeof input.comparison === "string" && input.comparison in COMPARISON_MAP
        ? COMPARISON_MAP[input.comparison as ComparisonName]
        : (input.comparison as Comparison);
  }

  return result;
}
