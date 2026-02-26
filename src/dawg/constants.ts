// Belarusian alphabet mapping (must match builder/compress.ts)
export const ALPHABET = 'абвгдежзійклмнопрстуўфхцчшыьэюя\'-';

export const CHAR_MAP = new Map<string, number>();
export const CHARS: string[] = [];

for (let i = 0; i < ALPHABET.length; i++) {
  CHAR_MAP.set(ALPHABET[i], i);
  CHARS.push(ALPHABET[i]);
}
