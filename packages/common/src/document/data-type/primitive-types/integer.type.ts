import { isInteger, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';
import { NumberType } from './number.type.js';

@SimpleType({
  description: 'An integer number'
})
export class IntegerType extends NumberType {

  constructor(attributes?: Partial<IntegerType>) {
    super(attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [isInteger];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    return this[DECODER]();
  }

}
