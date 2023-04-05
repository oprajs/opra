import { SimpleType } from '../simple-type.js';

const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;

@SimpleType({
  name: 'bigint',
  description: 'BigInt number',
  ctor: BigIntConstructor
})
export class BigIntType {

  decode(v: any): bigint | undefined {
    if (v == null) return v;
    return typeof v === 'bigint' ? v : BigInt(v);
  }

  encode(v: any): string | undefined {
    if (v == null) return v;
    return typeof v === 'bigint' ? String(v) : undefined;
  }

  coerce(v: any): bigint | undefined {
    return this.decode(v);
  }

  validate(v: any): void {
    if (!((typeof v === 'number' && !isNaN(v)) || typeof v === 'bigint'))
      throw new TypeError(`Invalid number value "${v}"`);
  }

}
