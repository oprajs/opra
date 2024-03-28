import { isAny, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Represents any value'
})
export class AnyType {

  constructor(attributes?: Partial<AnyType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isAny;
  }

  [ENCODER](): Validator {
    return isAny;
  }

}
