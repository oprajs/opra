import { isDateString, toString, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A date without time',
  nameMappings: {
    js: 'Date',
    json: 'string',
  },
}).Example('2021-04-18', 'Full date value')
export class DateType {
  constructor(attributes?: Partial<DateType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDate({ precision: 'date', coerce: true });
    const x: Validator[] = [];
    if (properties.minValue) {
      isDateString(properties.minValue);
      x.push(toString, vg.isGte(properties.minValue));
    }
    if (properties.maxValue) {
      isDateString(properties.maxValue);
      x.push(toString, vg.isLte(properties.maxValue));
    }
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    const fn = vg.isDateString({ precision: 'date', trim: 'date', coerce: true });
    const x: Validator[] = [];
    if (properties.minValue) {
      isDateString(properties.minValue);
      x.push(vg.isGte(properties.minValue));
    }
    if (properties.maxValue) {
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
