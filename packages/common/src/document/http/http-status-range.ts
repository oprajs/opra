import { OpraSchema } from '../../schema/index.js';

const STATUS_RANGE_PATTERN = /^([1-6]\d{2})(?:-([1-6]\d{2}))?$/;

/**
 * @class HttpStatusRange
 */
export class HttpStatusRange {
  start: number = 0;
  end: number = 0;

  constructor(value: string);
  constructor(start: number, end?: number);
  constructor(init: Pick<HttpStatusRange, 'start' | 'end'>);
  constructor(arg0: any, arg1?: number) {
    if (arg0 && typeof arg0 === 'object') {
      this.start = arg0.start || 0;
      this.end = arg0.end || 0;
    }
    if (typeof arg0 === 'number') {
      this.start = arg0;
      this.end = arg1 || this.start;
    }
    if (typeof arg0 === 'string') {
      const m = STATUS_RANGE_PATTERN.exec(arg0);
      if (!m) throw new TypeError(`"${arg0}" is not a valid Status Code range`);
      this.start = parseInt(m[1], 10);
      this.end = m[2] ? parseInt(m[2], 10) : this.start;
    }
  }

  includes(statusCode: number): boolean {
    return statusCode >= this.start && statusCode <= this.end;
  }

  intersects(start: number, end: number): boolean {
    return end >= this.start && start <= this.end;
  }

  toString(): string {
    if (this.start === this.end) return String(this.start);
    return String(this.start) + '-' + String(this.end);
  }

  toJSON(): OpraSchema.HttpStatusRange | number {
    return !this.end || this.start === this.end ? this.start : { start: this.start, end: this.end };
  }
}
