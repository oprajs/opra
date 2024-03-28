import { isNumber, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Both Integer as well as Floating-Point numbers'
})
export class NumberType {

  constructor(attributes?: Partial<NumberType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [isNumber];
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
  minValue?: number;

  @SimpleType.Attribute({
    description: 'Maximum value'
  })
  maxValue?: number;

}
