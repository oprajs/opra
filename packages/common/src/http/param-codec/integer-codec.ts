import {NumberCodec, NumberFormatOptions} from './number-codec.js';

export interface IntegerFormatOptions extends NumberFormatOptions {
  enum?: number[];
}

export class IntegerCodec extends NumberCodec {
  enum?: number[];

  constructor(options?: IntegerFormatOptions) {
    super(options);
    this.enum = options?.enum;
  }

  decode(value: string): number {
    const v = super.decode(value);

    if (!Number.isInteger(v))
      throw new TypeError(`"${value}" is not a valid integer`);

    if (this.enum && !this.enum.includes(v))
      throw new TypeError(`"${value}" is not one of allowed enum values (${this.enum}).`);

    return v;
  }
}
