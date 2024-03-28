import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An approximate date value',
  example: [
    '2021-04-18',
    '2021-04',
    '2021',
  ]
})
export class ApproxDateType {

  constructor(attributes?: Partial<ApproxDateType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [vg.isDateString({trim: 'date'})];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    return this[DECODER]();
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
