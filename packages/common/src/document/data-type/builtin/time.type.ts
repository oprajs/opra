import { SimpleType } from '../simple-type.js';
import { StringType } from './string.type.js';

const TIME_PATTERN = /^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])?(?:\.(\d+))?$/;

@SimpleType({
  description: 'Time formatted string',
})
export class TimeType extends StringType {

  decode(v: any): string | undefined {
    if (v == null) return v;
    this.validate(v);
    return v;
  }

  encode(v: any): string | undefined {
    return this.decode(v);
  }

  coerce(v: any): string | undefined {
    return this.decode(v);
  }

  validate(v: string): void {
    // noinspection SuspiciousTypeOfGuard
    if (typeof v === 'string' && !TIME_PATTERN.test(v))
      throw new TypeError(`Invalid Time value "${v}"`);
  }

}
