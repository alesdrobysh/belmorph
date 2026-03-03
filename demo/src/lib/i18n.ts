export const POS: Record<string, string> = {
  N: 'назоўнік',
  V: 'дзеяслоў',
  A: 'прыметнік',
  P: 'дзеепрыметнік',
  R: 'прыслоўе',
  S: 'займеннік',
  M: 'лічэбнік',
  C: 'злучнік',
  I: 'прыназоўнік',
  E: 'часціца',
  Y: 'выклічнік',
  Z: 'пабочнае слова',
  W: 'прэдыкатыў',
  F: 'частка слова',
};

export const CASE: Record<string, string> = {
  N: 'Назоўны',
  G: 'Родны',
  D: 'Давальны',
  A: 'Вінавальны',
  I: 'Творны',
  L: 'Месны',
  V: 'Клічны',
};

export const NUMBER: Record<string, string> = {
  S: 'Адзіночны',
  P: 'Множны',
};

export const GENDER: Record<string, string> = {
  M: 'Мужчынскі',
  F: 'Жаночы',
  N: 'Ніякі',
  C: 'Агульны',
};

export const TENSE: Record<string, string> = {
  R: 'Цяперашні',
  P: 'Прошлы',
  F: 'Будучы',
  Q: 'Перадпрошлы',
};

export const PERSON: Record<string, string> = {
  '1': '1-я',
  '2': '2-я',
  '3': '3-я',
  '0': 'безасабовы',
};

export const MOOD: Record<string, string> = {
  I: 'абвесны лад',
  M: 'загадны лад',
};

export const ASPECT: Record<string, string> = {
  P: 'закончаны від',
  M: 'незакончаны від',
};

export const VOICE: Record<string, string> = {
  A: 'дзейны стан',
  P: 'зваротны стан',
};

export const COMPARISON: Record<string, string> = {
  P: 'станоўчая',
  C: 'вышэйшая',
  S: 'найвышэйшая',
};

export const ANIMACY: Record<string, string> = {
  A: 'Адушаўлёны',
  I: 'Неадушаўлёны',
};

// ── Abbreviations (BE) ────────────────────────────────────────────────────────

export const CASE_ABBR: Record<string, string> = {
  N: 'Наз', G: 'Род', D: 'Дав', A: 'Він', I: 'Тв', L: 'Мес', V: 'Кл',
};
export const NUMBER_ABBR: Record<string, string> = { S: 'Адз', P: 'Мн' };
export const GENDER_ABBR: Record<string, string> = { M: 'Мужч', F: 'Жан', N: 'Ніяк', C: 'Аг' };
export const TENSE_ABBR: Record<string, string> = { R: 'Цяп', P: 'Прош', F: 'Буд', Q: 'ПП' };
export const PERSON_ABBR: Record<string, string> = { '1': '1', '2': '2', '3': '3', '0': '0' };
export const COMPARISON_ABBR: Record<string, string> = { P: 'Ст', C: 'Выш', S: 'Найв' };
export const VOICE_ABBR: Record<string, string> = { A: 'Дз', P: 'Зв' };

// ── English maps ──────────────────────────────────────────────────────────────

export const POS_EN: Record<string, string> = {
  N: 'noun', V: 'verb', A: 'adjective', P: 'participle', R: 'adverb',
  S: 'pronoun', M: 'numeral', C: 'conjunction', I: 'preposition',
  E: 'particle', Y: 'interjection', Z: 'parenthetical', W: 'predicative', F: 'word part',
};
export const CASE_EN: Record<string, string> = {
  N: 'Nominative', G: 'Genitive', D: 'Dative',
  A: 'Accusative', I: 'Instrumental', L: 'Locative', V: 'Vocative',
};
export const NUMBER_EN: Record<string, string> = { S: 'Singular', P: 'Plural' };
export const GENDER_EN: Record<string, string> = { M: 'Masculine', F: 'Feminine', N: 'Neuter', C: 'Common' };
export const TENSE_EN: Record<string, string> = { R: 'Present', P: 'Past', F: 'Future', Q: 'Pluperfect' };
export const PERSON_EN: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd', '0': 'impersonal' };
export const MOOD_EN: Record<string, string> = { I: 'indicative', M: 'imperative' };
export const ASPECT_EN: Record<string, string> = { P: 'perfective', M: 'imperfective' };
export const VOICE_EN: Record<string, string> = { A: 'active', P: 'passive' };
export const COMPARISON_EN: Record<string, string> = { P: 'Positive', C: 'Comparative', S: 'Superlative' };
export const ANIMACY_EN: Record<string, string> = { A: 'Animate', I: 'Inanimate' };

// ── Abbreviations (EN) ────────────────────────────────────────────────────────

export const CASE_ABBR_EN: Record<string, string> = {
  N: 'Nom', G: 'Gen', D: 'Dat', A: 'Acc', I: 'Ins', L: 'Loc', V: 'Voc',
};
export const NUMBER_ABBR_EN: Record<string, string> = { S: 'Sg', P: 'Pl' };
export const GENDER_ABBR_EN: Record<string, string> = { M: 'Masc', F: 'Fem', N: 'Neut', C: 'Com' };
export const TENSE_ABBR_EN: Record<string, string> = { R: 'Pres', P: 'Past', F: 'Fut', Q: 'Plup' };
export const COMPARISON_ABBR_EN: Record<string, string> = { P: 'Pos', C: 'Cmp', S: 'Sup' };
export const VOICE_ABBR_EN: Record<string, string> = { A: 'Act', P: 'Pass' };

// ── Grouped labels ────────────────────────────────────────────────────────────

export const LABELS = {
  be: {
    POS, CASE, NUMBER, GENDER, TENSE, PERSON, MOOD, ASPECT, VOICE, COMPARISON, ANIMACY,
    CASE_ABBR, NUMBER_ABBR, GENDER_ABBR, TENSE_ABBR, PERSON_ABBR, COMPARISON_ABBR, VOICE_ABBR,
  },
  en: {
    POS: POS_EN, CASE: CASE_EN, NUMBER: NUMBER_EN, GENDER: GENDER_EN, TENSE: TENSE_EN,
    PERSON: PERSON_EN, MOOD: MOOD_EN, ASPECT: ASPECT_EN, VOICE: VOICE_EN,
    COMPARISON: COMPARISON_EN, ANIMACY: ANIMACY_EN,
    CASE_ABBR: CASE_ABBR_EN, NUMBER_ABBR: NUMBER_ABBR_EN, GENDER_ABBR: GENDER_ABBR_EN,
    TENSE_ABBR: TENSE_ABBR_EN, PERSON_ABBR, COMPARISON_ABBR: COMPARISON_ABBR_EN,
    VOICE_ABBR: VOICE_ABBR_EN,
  },
};

// ── UI strings ────────────────────────────────────────────────────────────────

export const UI = {
  be: {
    tagline: 'Беларускі марфалагічны аналізатар для TypeScript.',
    playground: 'Паспрабуй', loading: 'Загрузка слоўніка…', examples: 'Прыклады:',
    codeExamples: 'Прыклады кода', whyTitle: 'Чаму belmorph?', attributionTitle: 'Атрыбуцыя',
    whyText: 'Беларуская мова — малавыкарыстальны рэсурс у экасістэме JS/TS. belmorph запаўняе гэты прабел, даючы распрацоўнікам поўны марфалагічны аналіз для чат-ботаў, пошуку, аўтакарэкцыі і NLP-канвеераў.',
    placeholder: 'Увядзіце слова…', predicted: 'прадказана', formOf: 'форма слова',
    inflection: 'Словазмяненне', impossible: 'немагчымая форма',
    showForms: 'Паказаць усе формы', hideForms: 'Схаваць усе формы',
    case: 'Склон', number: 'Лік', gender: 'Род', voice: 'Стан', tense: 'Час',
    person: 'Асоба', comparison: 'Ступень параўнання', person_suffix: 'асоба',
    singular_abbr: 'Адз.', plural_abbr: 'Мн.', plural_abbr2: 'мн.',
    masc_abbr: 'Мужч.', fem_abbr: 'Жан.', neut_abbr: 'Ніяк.',
    infinitive: 'Інфінітыў', presentTense: 'Цяперашні час', futureTense: 'Будучы час',
    pastTense: 'Прошлы час', imperative: 'Загадны лад', gerunds: 'Дзеепрыслоўі',
    license: 'ліцэнзія MIT AND CC-BY-SA 4.0',
    credit: 'Зроблена з ♥ для беларускай мовы',
    snippetTitles: ['Разбор слова', 'Скланенне', 'Поўная лексема', 'Рэальныя прыклады'],
    copy: 'Скапіяваць',
    lema: 'лема',
    posLabel: 'Часціна мовы',
    animacyLabel: 'Адушаўлёнасць',
    aspectLabel: 'Від',
    moodLabel: 'Лад',
    interp1: 'інтэрпрэтацыя',
    interp2: 'інтэрпрэтацыі',
    notFound: 'Слова не знойдзена ў слоўніку',
  },
  en: {
    tagline: 'Belarusian morphological analyzer for TypeScript.',
    playground: 'Try it', loading: 'Loading dictionary…', examples: 'Examples:',
    codeExamples: 'Code Examples', whyTitle: 'Why belmorph?', attributionTitle: 'Attribution',
    whyText: 'Belarusian is an underrepresented language in the JS/TS ecosystem. belmorph fills this gap, giving developers full morphological analysis for chatbots, search, autocorrect, and NLP pipelines.',
    placeholder: 'Enter a word…', predicted: 'predicted', formOf: 'form of',
    inflection: 'Inflection', impossible: 'impossible form',
    showForms: 'Show all forms', hideForms: 'Hide all forms',
    case: 'Case', number: 'Number', gender: 'Gender', voice: 'Voice', tense: 'Tense',
    person: 'Person', comparison: 'Degree', person_suffix: '',
    singular_abbr: 'Sg.', plural_abbr: 'Pl.', plural_abbr2: 'pl.',
    masc_abbr: 'Masc.', fem_abbr: 'Fem.', neut_abbr: 'Neut.',
    infinitive: 'Infinitive', presentTense: 'Present tense', futureTense: 'Future tense',
    pastTense: 'Past tense', imperative: 'Imperative', gerunds: 'Gerunds',
    license: 'MIT AND CC-BY-SA 4.0 license',
    credit: 'Made with ♥ for the Belarusian language',
    snippetTitles: ['Parse a word', 'Inflection', 'Full lexeme', 'Real-world examples'],
    copy: 'Copy',
    lema: 'lemma',
    posLabel: 'Part of speech',
    animacyLabel: 'Animacy',
    aspectLabel: 'Aspect',
    moodLabel: 'Mood',
    interp1: 'interpretation',
    interp2: 'interpretations',
    notFound: 'Word not found in the dictionary',
  },
};
