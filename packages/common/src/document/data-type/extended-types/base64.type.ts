import { type Validator, vg } from 'valgen';
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
  constructor(attributes?: Partial<Base64Type>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](): Validator {
    return vg.isBase64({ coerce: true });
  }

  protected [ENCODER](): Validator {
    return vg.isBase64({ coerce: true });
  }
}
