import { isNull, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Null value',
  nameMappings: {
    js: 'null',
    json: 'null',
  },
})
export class NullType {
  constructor(properties?: Partial<NullType>) {
    if (properties) Object.assign(this, properties);
  }

  protected [DECODER](): Validator {
    return isNull;
  }

  protected [ENCODER](): Validator {
    return isNull;
  }
}
