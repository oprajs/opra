import { toString } from 'putil-varhelpers';
import { SimpleType } from '../simple-type.js';
import { StringType } from './string.type.js';

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@SimpleType({
  description: 'A Globally Unique Identifier (GUID) value',
})
export class GuidType extends StringType {

  decode(v: any): string | undefined {
    if (v == null) return v;
    const s = toString(v);
    if (s)
      this.validate(s);
    return s;
  }

  encode(v: any): string | undefined {
    return this.decode(v);
  }

  coerce(v: any): string | undefined {
    return this.decode(v);
  }

  validate(v: string): void {
    // noinspection SuspiciousTypeOfGuard
    if (typeof v === 'string' && !GUID_PATTERN.test(v))
      throw new TypeError(`Invalid GUID value "${v}"`);
  }

}
