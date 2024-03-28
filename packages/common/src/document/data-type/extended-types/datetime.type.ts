import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A full datetime value',
  example: [
    '2021-04-18T22:30:15',
    '2021-04-18 22:30:15',
    '2021-04-18 22:30'
  ]
})
export class DatetimeType {

  constructor(attributes?: Partial<DatetimeType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [vg.isDate({precision: 'time'})];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    const x: Validator[] = [vg.isDateString({precision: 'time', trim: 'time'})];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  @SimpleType.Attribute({
    description: 'Minimum value'
  })
  minValue?: string;

  @SimpleType.Attribute({
    description: 'Maximum value'
  })
  maxValue?: string;

}
