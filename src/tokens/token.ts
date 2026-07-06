import type { TokenType, WordSubType } from './types.js';

export class Token {
  readonly type: TokenType;
  readonly subType?: WordSubType;
  readonly st: number;
  readonly length: number;
  readonly source: string;

  constructor(
    source: string,
    st: number,
    length: number,
    type: TokenType,
    subType?: WordSubType,
  ) {
    this.source = source;
    this.st = st;
    this.length = length;
    this.type = type;
    if (subType) this.subType = subType;
  }

  get en(): number {
    return this.st + this.length;
  }

  get firstUpper(): boolean {
    const ch = this.source[this.st];
    return ch !== undefined && ch !== ch.toLocaleLowerCase();
  }

  get allUpper(): boolean {
    for (let i = this.st; i < this.en; i++) {
      const ch = this.source[i]!;
      if (ch.toLocaleLowerCase() !== ch.toLocaleUpperCase() && ch === ch.toLocaleLowerCase()) {
        return false;
      }
    }
    return this.firstUpper;
  }

  isCapitalized(): boolean {
    return this.firstUpper && !this.allUpper;
  }

  toString(): string {
    return this.source.slice(this.st, this.en);
  }

  toLowerCase(): string {
    return this.toString().toLocaleLowerCase();
  }

  indexOf(str: string): number {
    return this.toString().indexOf(str);
  }
}
