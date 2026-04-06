import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  name: 'mobilephone',
  description: 'A Mobile Phone Number value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
export class MobilePhoneType {
  constructor(attributes?: Partial<MobilePhoneType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Locale to use for validation',
  })
  locale?: vg.isMobilePhone.MobilePhoneLocale;

  protected [DECODER](properties?: Partial<this>): Validator {
    return vg.isMobilePhone({
      coerce: true,
      locale: properties?.locale || 'tr-TR',
    });
  }

  protected [ENCODER](properties?: Partial<this>): Validator {
    return vg.isMobilePhone({
      coerce: true,
      locale: properties?.locale || 'tr-TR',
    });
  }
}
