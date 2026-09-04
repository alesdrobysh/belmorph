import { Token } from './token.js';
import { TokenType, WordSubType } from './types.js';

const CYRILLIC_RE = /^[\u0400-\u04FF\u0500-\u052F]$/u;
const LATIN_RE = /^[a-zA-Z\u00C0-\u024F]$/u;
const DIGIT_RE = /^[0-9]$/;

function isCyrillic(ch: string): boolean { return CYRILLIC_RE.test(ch); }
function isLatin(ch: string): boolean   { return LATIN_RE.test(ch); }
function isLetter(ch: string): boolean  { return isCyrillic(ch) || isLatin(ch); }
function isDigit(ch: string): boolean   { return DIGIT_RE.test(ch); }
function isLetterOrDigit(ch: string): boolean { return isLetter(ch) || isDigit(ch); }

function isApostrophe(ch: string): boolean {
  return /[\u2018\u2019\u201B\u02BB\u02BC\u2032\u2035\uFF07]/u.test(ch);
}

function wordSubType(ch: string): WordSubType {
  if (isCyrillic(ch)) return WordSubType.CYRIL;
  if (isLatin(ch)) return WordSubType.LATIN;
  return WordSubType.MIXED;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isUrlStart(source: string, i: number, links: boolean): boolean {
  if (!links) return false;
  if (source.slice(i, i + 8) === 'https://') return true;
  if (source.slice(i, i + 7) === 'http://') return true;
  if (source.slice(i, i + 6) === 'ftp://') return true;
  if (source.slice(i, i + 4).toLowerCase() === 'www.' &&
      i + 4 < source.length && isLetterOrDigit(source[i + 4]!)) return true;
  return false;
}

export interface TokenizerOptions {
  hashtags?: boolean;
  mentions?: boolean;
  emails?: boolean;
  links?: boolean;
}

const DEFAULT_OPTIONS: Required<TokenizerOptions> = {
  hashtags: true,
  mentions: true,
  emails: true,
  links: true,
};

export class Tokenizer {
  private tokens: Token[] = [];
  private source = '';
  private opts: Required<TokenizerOptions>;

  constructor(options?: TokenizerOptions) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
  }

  append(text: string): this {
    // Handle tokens that might span chunk boundaries:
    // If the last token is a WORD or NUMBER, pop it and re-tokenize from its start.
    let i: number;
    if (this.tokens.length > 0) {
      const lastToken = this.tokens[this.tokens.length - 1]!;
      if (lastToken.type === TokenType.WORD || lastToken.type === TokenType.NUMBER) {
        this.tokens.pop();
        i = lastToken.st;
      } else {
        i = this.source.length;
      }
    } else {
      i = this.source.length;
    }

    const offs = this.source.length;
    this.source += text;

    while (i < this.source.length) {
      const ch = this.source[i]!;
      let token: Token | null = null;

      // ---- WHITESPACE ----
      if (ch === ' ' || ch === '\t') {
        const st = i;
        while (i < this.source.length && (this.source[i] === ' ' || this.source[i] === '\t')) i++;
        token = new Token(this.source, st, i - st, TokenType.SPACE);
      }
      // ---- NEWLINE ----
      else if (ch === '\n' || ch === '\r') {
        const st = i;
        if (ch === '\r' && this.source[i + 1] === '\n') i += 2;
        else i++;
        token = new Token(this.source, st, i - st, TokenType.NEWLINE);
      }
      // ---- HASHTAG ----
      else if (this.opts.hashtags && ch === '#' && this.isHashtagStart(i)) {
        const st = i++;
        while (i < this.source.length && isLetterOrDigit(this.source[i]!)) i++;
        token = new Token(this.source, st, i - st, TokenType.HASHTAG);
      }
      // ---- MENTION ----
      else if (this.opts.mentions && ch === '@' && this.isMentionStart(i)) {
        const st = i++;
        while (i < this.source.length && (isLetterOrDigit(this.source[i]!) || this.source[i] === '_')) i++;
        token = new Token(this.source, st, i - st, TokenType.MENTION);
      }
      // ---- URL (must be checked before WORD since URLs start with letters) ----
      else if (isUrlStart(this.source, i, this.opts.links)) {
        const st = i;
        while (i < this.source.length) {
          const c = this.source[i]!;
          if (c === ' ' || c === '\t' || c === '\n' || c === '\r' ||
              c === '"' || c === '\'' || c === '<' || c === '>') break;
          i++;
        }
        token = new Token(this.source, st, i - st, TokenType.LINK);
      }
      // ---- WORD (Cyrillic or Latin) ----
      else if (isLetter(ch)) {
        const st = i;
        const firstSubType = wordSubType(ch);
        let currentSubType = firstSubType;
        while (i < this.source.length) {
          const c = this.source[i]!;
          if (isLetter(c)) {
            const st2 = wordSubType(c);
            if (st2 !== currentSubType) currentSubType = WordSubType.MIXED;
            i++;
          } else if (c === '-' && i + 1 < this.source.length && isLetter(this.source[i + 1]!)) {
            currentSubType = WordSubType.MIXED;
            i++;
          } else if ((c === "'" || isApostrophe(c)) && i + 1 < this.source.length && isLetter(this.source[i + 1]!)) {
            i++;
          } else if ((c === '@' || c === '.') && i + 1 < this.source.length && isLetterOrDigit(this.source[i + 1]!)) {
            // Email-aware: allow @ and . inside words to capture emails as single tokens
            i++;
          } else {
            break;
          }
        }
        token = new Token(this.source, st, i - st, TokenType.WORD, currentSubType);
      }
      // ---- NUMBER ----
      else if (isDigit(ch)) {
        const st = i++;
        while (i < this.source.length && isDigit(this.source[i]!)) i++;
        if (i < this.source.length && (this.source[i] === '.' || this.source[i] === ',') &&
            i + 1 < this.source.length && isDigit(this.source[i + 1]!)) {
          i++;
          while (i < this.source.length && isDigit(this.source[i]!)) i++;
        }
        token = new Token(this.source, st, i - st, TokenType.NUMBER);
      }
      // ---- PUNCTUATION ----
      else {
        const st = i++;
        token = new Token(this.source, st, 1, TokenType.PUNCT);
      }

      this.tokens.push(token);
    }

    return this;
  }

  done(): Token[] {
    if (this.opts.emails) {
      for (let i = 0; i < this.tokens.length; i++) {
        const t = this.tokens[i]!;
        if (t.type === TokenType.WORD && t.toString().includes('@') && EMAIL_RE.test(t.toString())) {
          this.tokens[i] = new Token(t.source, t.st, t.length, TokenType.EMAIL);
        }
      }
    }
    return this.tokens;
  }

  static tokenize(text: string, options?: TokenizerOptions): Token[] {
    return new Tokenizer(options).append(text).done();
  }

  private isHashtagStart(i: number): boolean {
    if (i > 0 && isLetterOrDigit(this.source[i - 1]!)) return false;
    return i + 1 < this.source.length && isLetter(this.source[i + 1]!);
  }

  private isMentionStart(i: number): boolean {
    if (i > 0 && isLetterOrDigit(this.source[i - 1]!)) return false;
    return i + 1 < this.source.length && isLetter(this.source[i + 1]!);
  }
}
