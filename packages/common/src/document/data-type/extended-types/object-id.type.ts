import { isEmail, isObjectId, isString, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A MongoDB ObjectID value'
})
export class ObjectIdType {

  constructor(attributes?: Partial<ObjectIdType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isObjectId;
  }

  [ENCODER](): Validator {
    return vg.pipe(isObjectId, isString);
  }

}
