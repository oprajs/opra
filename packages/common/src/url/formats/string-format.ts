import {Format} from './format.js';

export interface StringFormatOptions {
  maxLength?: number;
  minLength?: number;
  enum?: string[];
}

export class StringFormat extends Format {
  maxLength?: number;
  minLength?: number;
  enum?: string[];

  constructor(options?: StringFormatOptions) {
    super();
    this.maxLength = options?.maxLength;
    this.minLength = options?.minLength;
    this.enum = options?.enum;
  }

  parse(value: string): string {
    if (this.minLength != null && value.length < this.minLength)
      throw new TypeError(`Value must be at least ${this.minLength} character${this.minLength > 1 ? 's' : ''} long.`);

    if (this.maxLength != null && value.length > this.maxLength)
      throw new TypeError(`Value can be up to ${this.maxLength} character${this.maxLength > 1 ? 's' : ''} long.`);

    if (this.enum && !this.enum.includes(value))
      throw new TypeError(`"${value}" is not one of allowed enum values (${this.enum}).`);

    return value;
  }

  stringify(value: any): string {
    return value == null ? '' : '' + value;
  }

}
