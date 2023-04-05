import { toInt } from 'putil-varhelpers';
import { SimpleType } from '../simple-type.js';
import { NumberType } from './number.type.js';

@SimpleType({
  description: 'An integer number',
})
export class IntegerType extends NumberType {

  decode(v: any): number | undefined {
    if (v == null) return v;
    return toInt(super.decode(v))
  }

  encode(v: any): number | undefined {
    if (v == null) return v;
    return toInt(super.encode(v));
  }

  coerce(v: any): number | undefined {
    return this.decode(v);
  }

}
