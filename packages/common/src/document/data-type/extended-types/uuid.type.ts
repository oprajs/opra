import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Universal Unique Identifier (UUID) value',
})
export class UuidType {
  constructor(attributes?: Partial<UuidType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Version of the UUID',
  })
  version?: 1 | 2 | 3 | 4 | 5;

  protected [DECODER](properties?: Partial<this>): Validator {
    return vg.isUUID(properties?.version, { coerce: true });
  }

  protected [ENCODER](properties?: Partial<this>): Validator {
    return vg.isUUID(properties?.version, { coerce: true });
  }
}