import {ValidationError} from '../errors';
import {Nullable} from '../types';
import {NumberFormat, NumberValueParserOptions} from './number-format';

export interface IntegerValueParserOptions extends NumberValueParserOptions {
  enum?: number[];
}

export class IntegerFormat extends NumberFormat {
  enum?: number[];

  constructor(options?: IntegerValueParserOptions) {
    super(options);
    this.enum = options?.enum;
  }

  protected _parseItem(value: string, key: string, index: number): Nullable<number> {
    const v = super._parseItem(value, key, index);
    if (v == null)
      return v;

    if (!Number.isInteger(v))
      throw new ValidationError(`"${key}[${index}]" is not a valid integer number.`);

    if (this.enum && !this.enum.includes(v))
      throw new ValidationError(`"${key}[${index}]" (${value}) is not a valid enumerated value. Allowed values are (${this.enum}).`);

    return v;
  }
}
