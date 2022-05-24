import {ValidationError} from '../errors';
import {Format} from './format';

export interface NumberFormatOptions {
  max?: number;
  min?: number;
}

export class NumberFormat extends Format {
  max?: number;
  min?: number;

  constructor(options?: NumberFormatOptions) {
    super();
    this.max = options?.max;
    this.min = options?.min;
  }

  parse(value: string): number {
    // noinspection SuspiciousTypeOfGuard
    const v = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(v))
      throw new ValidationError(`"${value}" is not a valid number`);

    if (this.min != null && v < this.min)
      throw new ValidationError(`Value must be ${this.min} or greater.`);

    if (this.max != null && v > this.max)
      throw new ValidationError(`Value must be ${this.max} or less.`);

    return v;
  }

  stringify(value: any): string {
    return typeof value === 'number' ? '' + value : '';
  }
}
