import {NumberFormat, NumberFormatOptions} from './number-format.js';

export interface IntegerFormatOptions extends NumberFormatOptions {
  enum?: number[];
}

export class IntegerFormat extends NumberFormat {
  enum?: number[];

  constructor(options?: IntegerFormatOptions) {
    super(options);
    this.enum = options?.enum;
  }

  parse(value: string): number {
    const v = super.parse(value);

    if (!Number.isInteger(v))
      throw new TypeError(`"${value}" is not a valid integer`);

    if (this.enum && !this.enum.includes(v))
      throw new TypeError(`"${value}" is not one of allowed enum values (${this.enum}).`);

    return v;
  }
}
