import type { HttpParams } from '../http-params.js';

export namespace StringCodec {
  export interface Options {
    maxLength?: number;
    minLength?: number;
    enum?: string[];
  }
}

export class StringCodec implements HttpParams.Codec {
  maxLength?: number;
  minLength?: number;
  enum?: string[];

  constructor(options?: StringCodec.Options) {
    this.maxLength = options?.maxLength;
    this.minLength = options?.minLength;
    this.enum = options?.enum;
  }

  decode(value: string): string {
    if (this.minLength != null && value.length < this.minLength)
      throw new TypeError(`Value must be at least ${this.minLength} character${this.minLength > 1 ? 's' : ''} long.`);

    if (this.maxLength != null && value.length > this.maxLength)
      throw new TypeError(`Value can be up to ${this.maxLength} character${this.maxLength > 1 ? 's' : ''} long.`);

    if (this.enum && !this.enum.includes(value))
      throw new TypeError(`"${value}" is not one of allowed enum values (${this.enum}).`);

    return value;
  }

  encode(value: any): string {
    return value == null ? '' : '' + value;
  }

}
