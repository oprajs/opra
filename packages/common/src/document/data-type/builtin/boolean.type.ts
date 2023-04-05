import { toBoolean } from 'putil-varhelpers';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Simple true/false value',
  ctor: Boolean
})
export class BooleanType {

  decode(v: any): boolean | undefined {
    if (v == null) return v;
    return toBoolean(v);
  }

  encode(v: any): boolean | undefined {
    if (v == null) return v;
    return toBoolean(v);
  }

  coerce(v: any): boolean | undefined {
    return this.decode(v);
  }

}
