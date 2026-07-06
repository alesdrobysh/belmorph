import type { Token } from './token.js';
import type { TokenType } from './types.js';

export function only(tokens: Token[], ...types: TokenType[]): Token[] {
  if (types.length === 0) return tokens;
  const set = new Set<string>(types);
  return tokens.filter(t => set.has(t.type));
}

export function except(tokens: Token[], ...types: TokenType[]): Token[] {
  if (types.length === 0) return tokens;
  const set = new Set<string>(types);
  return tokens.filter(t => !set.has(t.type));
}

export function join(tokens: Token[]): string {
  return tokens.map(t => t.toString()).join('');
}
