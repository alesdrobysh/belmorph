import type { MorphAnalyzer } from './analyzer.js';
import type { ParseResult } from './parse-result.js';
import { Token, Tokenizer, TokenType } from './tokens/index.js';
import type { TokenType as TT } from './tokens/types.js';

export interface AnalyzedToken {
  token: Token;
  /** Best morphological parse (first result), or null for non-WORD tokens. */
  parse: ParseResult | null;
}

export class TextAnalyzer {
  constructor(private morph: MorphAnalyzer) {}

  analyze(text: string): AnalyzedToken[] {
    const tokens = Tokenizer.tokenize(text);
    return tokens.map(token => {
      if (token.type === (TokenType.WORD as TT)) {
        const parses = this.morph.parse(token.toString());
        return { token, parse: parses.length > 0 ? parses[0]! : null };
      }
      return { token, parse: null };
    });
  }

  /** Return WORD tokens only, with their parse results. */
  words(text: string): AnalyzedToken[] {
    return this.analyze(text).filter(a => a.parse !== null);
  }
}
