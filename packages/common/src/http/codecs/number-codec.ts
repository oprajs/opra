import type {HttpParams} from '../http-params.js';

export namespace NumberCodec {
  export interface Options {
    max?: number;
    min?: number;
  }
}

export class NumberCodec implements HttpParams.Codec {
  max?: number;
  min?: number;

  constructor(options?: NumberCodec.Options) {
    this.max = options?.max;
    this.min = options?.min;
  }

  decode(value: string): number {
    // noinspection SuspiciousTypeOfGuard
    const v = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(v))
      throw new TypeError(`"${value}" is not a valid number`);

    if (this.min != null && v < this.min)
      throw new TypeError(`Value must be ${this.min} or greater.`);

    if (this.max != null && v > this.max)
      throw new TypeError(`Value must be ${this.max} or less.`);

    return v;
  }

  encode(value: any): string {
    return typeof value === 'number' ? '' + value : '';
  }
}
