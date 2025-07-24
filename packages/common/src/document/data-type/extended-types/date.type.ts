import { isDateString, toString, type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

const _isDateString = vg.isDateString({
  precisionMin: 'day',
  trim: 'day',
  coerce: true,
});

@(SimpleType({
  name: 'date',
  description: 'A date without time',
  nameMappings: {
    js: 'Date',
    json: 'string',
  },
}).Example('2021-04-18', 'Full date value'))
export class DateType {
  convertToNative?: boolean;

  constructor(attributes?: Partial<DateType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDate({
      trim: 'day',
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
