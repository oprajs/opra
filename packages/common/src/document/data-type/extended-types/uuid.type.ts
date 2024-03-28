import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Universal Unique Identifier (UUID) value'
})
export class UuidType {

  constructor(attributes?: Partial<UuidType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return vg.isUUID(this.version);
  }

  [ENCODER](): Validator {
    return vg.isUUID(this.version);
  }

  @SimpleType.Attribute({
    description: 'Version of the UUID'
  })
  version?: 1 | 2 | 3 | 4 | 5;

}
