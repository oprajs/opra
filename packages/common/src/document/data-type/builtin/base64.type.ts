import { SimpleType } from '../simple-type.js';

const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:(?:[A-Za-z0-9+/][AQgw](:?==)?)|(?:[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=?))?$/;

@SimpleType({
  description: 'A stream of bytes, base64 encoded',
  ctor: ArrayBuffer
})
export class Base64Type {

  decode(v: any): ArrayBuffer | undefined {
    if (v == null) return v;
    if (typeof v === 'string')
      this.validate(v);
    return Buffer.from(v, 'base64').buffer.slice(0);
  }

  encode(v: any): string | undefined {
    if (v == null) return v;
    if (Buffer.isBuffer(v))
      return (v as Buffer).toString('base64');
    return Buffer.from(v).toString('base64');
  }

  coerce(v: any): ArrayBuffer | undefined {
    if (v instanceof ArrayBuffer)
      return v;
    return this.decode(v);
  }

  validate(v: any): void {
    if (!(typeof v === 'string' && BASE64_PATTERN.test(v)))
      throw new TypeError(`Invalid base64 value "${String(v).substring(0, 10)}..."`);
  }

}
