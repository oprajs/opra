import { toBoolean, type Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Simple true/false value',
  nameMappings: {
    js: 'boolean',
    json: 'boolean',
  },
})
export class BooleanType {
  constructor(properties?: Partial<BooleanType>) {
    if (properties) Object.assign(this, properties);
  }

  protected [DECODER](): Validator {
    return toBoolean;
  }

  protected [ENCODER](): Validator {
    return toBoolean;
  }
}
