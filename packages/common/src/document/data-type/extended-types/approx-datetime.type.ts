import { isDateString, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An approximate datetime value.',
  example: [
    '2021-04-18T22:30:15+01:00',
    '2021-04-18T22:30:15',
    '2021-04-18 22:30',
    '2021-04-18',
    '2021-04',
    '2021',
  ]
})
export class ApproxDatetimeType {

  constructor(attributes?: Partial<ApproxDatetimeType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [isDateString];
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
