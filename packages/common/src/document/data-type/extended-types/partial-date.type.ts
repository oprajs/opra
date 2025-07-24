import { isDateString, toString, type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@(SimpleType({
  name: 'partialdate',
  description:
    'Specifies a point in time using a 24-hour clock notation.\rFormat: YYYY-[MM-[DD-[T?HH:[MM:[SS[.S[S[S[S]]]]]]]]][+/-ZZ:ZZ].',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
  .Example('2021-04-18T22:30:15:22+03:00')
  .Example('2021-04-18 22:30')
  .Example('2021-04-18')
  .Example('2021'))
export class PartialDateType {
  convertToNative?: boolean;

  constructor(attributes?: Partial<PartialDateType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDateString({
      format: [
        "yyyy-MM-dd'T'HH:mm:ss.SSSSxxx",
        "yyyy-MM-dd'T'HH:mm:ss.SSSS",
        "yyyy-MM-dd'T'HH:mm:ssxxx",
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd'T'HH:mm",
        "yyyy-MM-dd'T'HH",
        'yyyy-MM-dd',
        'yyyy-MM',
        'yyyy',
      ],
      coerce: properties?.convertToNative ?? false,
      parseISO: false,
    });
    const x: Validator[] = [];
    if (properties.minValue != null) {
      isDateString(properties.minValue);
      x.push(toString, vg.isGte(properties.minValue));
    }
    if (properties.maxValue != null) {
      isDateString(properties.maxValue);
      x.push(toString, vg.isLte(properties.maxValue));
    }
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    const fn = vg.isDateString({
      format: [
        "yyyy-MM-dd'T'HH:mm:ss.SSSSxxx",
        "yyyy-MM-dd'T'HH:mm:ss.SSSS",
        "yyyy-MM-dd'T'HH:mm:ssxxx",
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd'T'HH:mm",
        "yyyy-MM-dd'T'HH",
        'yyyy-MM-dd',
        'yyyy-MM',
        'yyyy',
      ],
      coerce: true,
    });
    const x: Validator[] = [];
    if (properties.minValue != null) {
      isDateString(properties.minValue);
      x.push(vg.isGte(properties.minValue));
    }
    if (properties.maxValue != null) {
      isDateString(properties.maxValue);
      x.push(vg.isLte(properties.maxValue));
    }
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  @SimpleType.Attribute({
    description: 'Minimum value',
  })
  minValue?: string;

  @SimpleType.Attribute({
    description: 'Maximum value',
  })
  maxValue?: string;
}
