import { toNumber } from 'putil-varhelpers';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Both Integer as well as Floating-Point numbers',
  ctor: Number
})
export class NumberType {

  decode(v: any): number | undefined {
    if (v == null) return v;
    const x = toNumber(v);
    if (x)
      this.validate(x);
    return x;
  }

  encode(v: any): number | undefined {
    return this.decode(v);
  }

  coerce(v: any): number | undefined {
    return this.decode(v);
  }

  validate(v: any): void {
    if (typeof v !== 'number' || isNaN(v))
      throw new TypeError(`Invalid number value "${v}"`);
  }
}
