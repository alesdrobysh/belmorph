export const TokenType = {
  WORD:    'WORD',
  NUMBER:  'NUMBER',
  PUNCT:   'PUNCT',
  SPACE:   'SPACE',
  NEWLINE: 'NEWLINE',
  EMAIL:   'EMAIL',
  LINK:    'LINK',
  HASHTAG: 'HASHTAG',
  MENTION: 'MENTION',
  OTHER:   'OTHER',
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export const WordSubType = {
  CYRIL: 'CYRIL',
  LATIN: 'LATIN',
  MIXED: 'MIXED',
} as const;

export type WordSubType = (typeof WordSubType)[keyof typeof WordSubType];
