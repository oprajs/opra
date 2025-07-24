import { isBase64, type Validator, validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  name: 'base64',
  description: 'A stream of bytes, base64 encoded',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
export class Base64Type {
  convertToNative?: boolean;

  constructor(attributes?: Partial<Base64Type>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isBase64({ coerce: true });
    if (properties.convertToNative)
      return vg.pipe([fn, toBuffer], { coerce: true });
    return fn;
  }

  protected [ENCODER](): Validator {
    return fromBuffer;
  }
}

const toBuffer = validator((base64String: string) => {
  return Buffer.from(base64String, 'base64');
});

const fromBuffer = validator((input: string | Buffer) => {
  if (Buffer.isBuffer(input)) return input.toString('base64');
  else {
    return isBase64(input);
  }
});
