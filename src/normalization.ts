/**
 * Normalize apostrophe-like characters to the ASCII apostrophe used by the
 * dictionary and DAWG alphabet.
 */
export function normalizeApostrophes(word: string): string {
  return word.replace(/[\u2018\u2019\u201B\u02BB\u02BC\u2032\u2035\uFF07]/g, "'");
}
