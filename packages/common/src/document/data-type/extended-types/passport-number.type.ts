import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  name: 'passportnumber',
  description: 'A Passport Number',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
export class PassportNumberType {
  constructor(attributes?: Partial<PassportNumberType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Country code',
  })
  countryCode?: string;

  protected [DECODER](properties?: Partial<this>): Validator {
    return vg.isPassportNumber(properties?.countryCode || 'TR', {
      coerce: true,
    });
  }

  protected [ENCODER](properties?: Partial<this>): Validator {
    return vg.isPassportNumber(properties?.countryCode || 'TR', {
      coerce: true,
    });
  }
}
