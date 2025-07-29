import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

const _isDateString = vg.isDateString({
  precisionMin: 'day',
  trim: 'tz',
  coerce: true,
});
const _isDate = vg.isDate({
  coerce: true,
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
    let fn: Validator;
    if (properties.convertToNative) {
      fn = _isDate;
    } else {
      fn = _isDateString;
    }
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
