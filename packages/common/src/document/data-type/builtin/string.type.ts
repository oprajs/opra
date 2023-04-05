import { toString } from 'putil-varhelpers';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A sequence of characters',
  ctor: String
})
export class StringType {

  decode(v: any): string | undefined {
    return toString(v);
  }

  encode(v: any): string | undefined {
    return toString(v);
  }

  coerce(v: any): string | undefined {
    return this.decode(v);
  }

}
