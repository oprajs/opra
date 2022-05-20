import {ValidationError} from '../errors';
import {quoteString, unquoteString} from '../utils/string-utils';
import {ArrayFormat, ArrayFormatOptions} from './format';

export interface StringValueParserOptions extends ArrayFormatOptions {
  maxLength?: number;
  minLength?: number;
  enum?: string[];
}

export class StringFormat extends ArrayFormat {
  maxLength?: number;
  minLength?: number;
  enum?: string[];

  constructor(options?: StringValueParserOptions) {
    super(options);
    this.maxLength = options?.maxLength;
    this.minLength = options?.minLength;
    this.enum = options?.enum;
  }

  protected _parseItem(value: string, key: string, index: number): string {
    const v = unquoteString(value == null ? '' : '' + value);

    if (this.minLength != null && v.length < this.minLength)
      throw new ValidationError(`"${key}[${index}]" must be at least ${this.minLength} character${this.minLength > 1 ? 's' : ''} long.`);

    if (this.maxLength != null && v.length > this.maxLength)
      throw new ValidationError(`"${key}[${index}]" can be up to ${this.maxLength} character${this.maxLength > 1 ? 's' : ''} long.`);

    if (this.enum && !this.enum.includes(v))
      throw new ValidationError(`"${key}[${index}]" (${value}) is not a valid enumerated value. Allowed values are (${this.enum}).`);

    return v;
  }

  protected _stringifyItem(value: any): string {
    return '' + quoteString(value);
  }

}
