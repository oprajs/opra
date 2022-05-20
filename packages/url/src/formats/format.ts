import {splitString} from '../utils/tokenizer';

export abstract class Format {

  abstract parse(value: string, key: string): any;

  abstract stringify(value: any, key: string): string;

}

export interface ArrayFormatOptions {
  arraySeparator?: string;
  maxOccurs?: number;
  minOccurs?: number;
  brackets?: string | boolean;
  quotes?: string | boolean;
}

export abstract class ArrayFormat extends Format {
  arraySeparator: string;
  maxOccurs: number;
  minOccurs: number;
  brackets?: string | boolean;
  quotes?: string | boolean;

  protected constructor(options?: ArrayFormatOptions) {
    super();
    this.arraySeparator = options?.arraySeparator || '|';
    this.maxOccurs = options?.maxOccurs || Infinity;
    this.minOccurs = options?.minOccurs || 0;
    this.brackets = options?.brackets ?? true;
    this.quotes = options?.quotes ?? true;
  }

  parse(value: string, key: string): any {
    if (!this.maxOccurs || this.maxOccurs < 2)
      return this._parseItem(value, key, 0);

    const arr = splitString(value, {
      delimiters: this.arraySeparator,
      brackets: this.brackets,
      quotes: this.quotes
    });
    if (arr.length === 1)
      return this._parseItem(value, key, 0);
    return arr.map((s, i) => this._parseItem(s, key, i++));
  }

  stringify(arr: any[], key: string): string {
    return arr
      .map((v, i) =>
        v == null ? '' : this._stringifyItem(v, key, i))
      .join(this.arraySeparator);
  }

  protected abstract _parseItem(value: string, key: string, index: number): any;

  protected abstract _stringifyItem(value: any, key: string, index: number): string;
}
