import { isNull, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Null value'
})
export class NullType {

  constructor(attributes?: Partial<NullType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isNull
  }

  [ENCODER](): Validator {
    return isNull;
  }
}
