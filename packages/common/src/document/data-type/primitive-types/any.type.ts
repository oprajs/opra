import { isAny, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Represents any value',
})
export class AnyType {
  constructor(properties?: Partial<AnyType>) {
    if (properties) Object.assign(this, properties);
  }

  protected [DECODER](): Validator {
    return isAny;
  }

  protected [ENCODER](): Validator {
    return isAny;
  }
}
