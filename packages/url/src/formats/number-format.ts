import {ValidationError} from '../errors';
import {Nullable} from '../types';
import {ArrayFormat, ArrayFormatOptions} from './format';

export interface NumberValueParserOptions extends ArrayFormatOptions {
  max?: number;
  min?: number;
}

export class NumberFormat extends ArrayFormat {
  max?: number;
  min?: number;

  constructor(options?: NumberValueParserOptions) {
    super(options);
    this.max = options?.max;
    this.min = options?.min;
  }

  protected _parseItem(value: string, key: string, index: number): Nullable<number> {
    if (value == null)
      return null;
    const v = parseFloat(value);
    if (isNaN(v))
      throw new ValidationError(`Invalid number value in "${key}[${index}]"`);

    if (this.min != null && v < this.min)
      throw new ValidationError(`Value of "${key}[${index}]" must be ${this.min} or greater.`);

    if (this.max != null && value.length > this.max)
      throw new ValidationError(`Value of "${key}[${index}]" must be ${this.max} or less.`);

    return v;
  }

  protected _stringifyItem(value: any): string {
    return '' + value;
  }
}
