import { isBase64, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A stream of bytes, base64 encoded'
})
export class Base64Type {
  constructor(attributes?: Partial<Base64Type>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isBase64;
  }

  [ENCODER](): Validator {
    return isBase64;
  }
}
