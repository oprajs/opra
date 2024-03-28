import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A date without time',
  example: ['2021-04-18']
})
export class DateType {

  constructor(attributes?: Partial<DateType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [vg.isDate({precision: 'date'})];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    const x: Validator[] = [vg.isDateString({precision: 'date', trim: 'date'})];
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
