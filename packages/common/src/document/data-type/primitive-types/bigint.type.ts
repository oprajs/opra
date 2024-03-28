import { isBigint, isString, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';
import { NumberType } from './number.type.js';

@SimpleType({
  description: 'BigInt number'
})
export class BigintType extends NumberType {

  constructor(attributes?: Partial<BigintType>) {
    super(attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [isBigint];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    return vg.pipe(this[DECODER](), isString);
  }
}
