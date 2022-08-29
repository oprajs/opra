/* eslint-disable max-len */
import {ValidationError} from '../errors.js';
import {Format} from './format.js';

// noinspection RegExpUnnecessaryNonCapturingGroup
const DATE_FORMAT_PATTERN = /^(\d{4})(?:-?(0[1-9]|1[012])(?:-?([123]0|[012][1-9]|31))?)?(?:[T ]?([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])?(?:\.(\d+))?(?:(Z)|(?:([+-])([01]?[0-9]|2[0-3]):?([0-5][0-9])?))?)?$/;

export interface DateFormatOptions {
  time?: boolean;
  timeZone?: boolean;
  min?: string;
  max?: string;
}

export class DateFormat extends Format {
  time: boolean;
  timeZone: boolean;
  min?: string;
  max?: string;

  constructor(options?: DateFormatOptions) {
    super();
    this.max = options?.max ? coerceToDateString(options.max) : undefined;
    this.min = options?.min ? coerceToDateString(options.min) : undefined;
    this.time = options?.time ?? true;
    this.timeZone = options?.timeZone ?? true;
  }

  parse(value: string): string {
    const v = coerceToDateString(value, this.time, this.timeZone);

    if (this.min != null && v < this.min)
      throw new ValidationError(`Value must be ${this.min} or greater.`);

    if (this.max != null && v > this.max)
      throw new ValidationError(`Value must be ${this.max} or less.`);
    return v;
  }

  stringify(value: any): string {
    return coerceToDateString(value, this.time, this.timeZone);
  }

}

function coerceToDateString(value: string, time?: boolean, timeZone?: boolean): string {
  if (value === '' || value == null)
    return '';

  const m = value.match(DATE_FORMAT_PATTERN);
  if (!m)
    throw new ValidationError(`"${value}" is not a valid date.`);
  let v = m[1] + '-' + (m[2] || '01') + '-' + (m[3] || '01');

  if (time) {
    v += 'T' + (m[4] || '00') + ':' + (m[5] || '00') + ':' + (m[6] || '00') +
      (m[7] ? '.' + m[7] : '');
    if (timeZone)
      v += m[8] ? 'Z' :
        (m[9] ? (m[9] + (m[10] || '00') + ':' + (m[11] || '00')) : '');
  }

  return v;
}
