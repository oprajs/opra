import { isDateString, toString, type Validator, validator, vg } from 'valgen';
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
  constructor(attributes?: Partial<PartialDateType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = toPartialDate;
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
    const fn = toPartialDate;
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

const _isDateString = vg.isDateString({
  precisionMin: 'year',
});

const toPartialDate = validator((input: string | Date) => {
  if (input instanceof Date) {
    let s = _isDateString(input, { coerce: true });
    if (s.endsWith('Z')) s = s.substring(0, s.length - 1);
    if (s.endsWith('.000')) s = s.substring(0, s.length - 4);
    if (s.endsWith(':00')) s = s.substring(0, s.length - 3);
    if (s.endsWith('00:00')) s = s.substring(0, s.length - 6);
    return s;
  }
  return _isDateString(input, { coerce: false });
});
