import { isDateString, toString, type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

const _isDateString = vg.isDateString({
  precisionMin: 'day',
  coerce: true,
  trim: 'tz',
});

@(SimpleType({
  name: 'datetime',
  description: 'A full datetime value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
  .Example('2021-04-18T22:30:15')
  .Example('2021-04-18 22:30:15')
  .Example('2021-04-18 22:30'))
export class DateTimeType {
  convertToNative?: boolean;

  constructor(attributes?: Partial<DateTimeType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDate({
      coerce: properties?.convertToNative,
    });
    const x: Validator[] = [];
    if (properties.minValue != null) {
      _isDateString(properties.minValue);
      x.push(toString, vg.isGte(properties.minValue));
    }
    if (properties.maxValue != null) {
      _isDateString(properties.maxValue);
      x.push(toString, vg.isLte(properties.maxValue));
    }
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    const x: Validator[] = [];
    if (properties.minValue != null) {
      isDateString(properties.minValue);
      x.push(vg.isGte(properties.minValue));
    }
    if (properties.maxValue != null) {
      isDateString(properties.maxValue);
      x.push(vg.isLte(properties.maxValue));
    }
    return x.length > 0
      ? vg.pipe([_isDateString, ...x], { returnIndex: 0 })
      : _isDateString;
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
