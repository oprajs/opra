import { isObject, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { ComplexType } from '../complex-type.js';

@ComplexType({
  name: 'object',
  description: 'A non modelled object',
  additionalFields: true,
  ctor: Object
})
export class ObjectType {

  constructor(attributes?: Partial<ObjectType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isObject;
  }

  [ENCODER](): Validator {
    return isObject;
  }

}
