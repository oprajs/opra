import { isBoolean, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Simple true/false value'
})
export class BooleanType {

  constructor(attributes?: Partial<BooleanType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isBoolean
  }

  [ENCODER](): Validator {
    return isBoolean;
  }

}
