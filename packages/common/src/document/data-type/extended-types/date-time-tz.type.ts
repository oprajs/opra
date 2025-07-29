import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

const _isDateString = vg.isDateString({
  precisionMin: 'tz',
  coerce: true,
});

@(SimpleType({
  name: 'datetimetz',
  description: 'A full datetime value with time zone information',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
}).Example('2021-04-18T22:30:15+03:00'))
export class DateTimeTypeTz {
  constructor(attributes?: Partial<DateTimeTypeTz>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn: Validator = _isDateString;
    const x: Validator[] = [fn];
    if (properties.minValue != null) {
      x.push(vg.isGte(fn(properties.minValue)));
    }
    if (properties.maxValue != null) {
      x.push(vg.isLte(fn(properties.maxValue)));
    }
    return x.length > 0 ? vg.pipe(x, { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    const fn: Validator = _isDateString;
    const x: Validator[] = [fn];
    if (properties.minValue != null) {
      x.push(vg.isGte(fn(properties.minValue)));
    }
    if (properties.maxValue != null) {
      x.push(vg.isLte(fn(properties.maxValue)));
    }
    return x.length > 0 ? vg.pipe(x, { returnIndex: 0 }) : fn;
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
