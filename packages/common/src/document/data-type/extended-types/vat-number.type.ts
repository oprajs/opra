import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  name: 'vatnumber',
  description: 'A VAT Number',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
export class VatNumberType {
  constructor(attributes?: Partial<VatNumberType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Country code',
  })
  countryCode?: vg.isVATNumber.CountryCode;

  protected [DECODER](properties?: Partial<this>): Validator {
    return vg.isVATNumber(properties?.countryCode || 'TR', {
      coerce: true,
    });
  }

  protected [ENCODER](properties?: Partial<this>): Validator {
    return vg.isVATNumber(properties?.countryCode || 'TR', {
      coerce: true,
    });
  }
}
