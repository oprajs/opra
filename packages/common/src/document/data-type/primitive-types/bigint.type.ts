import { toBigint, Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';
import { NumberType } from './number.type.js';

@SimpleType({
  description: 'BigInt number',
})
export class BigintType extends NumberType {
  constructor(attributes?: Partial<BigintType>) {
    super(attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const x: Validator[] = [];
    if (properties.minValue) x.push(vg.isGte(properties.minValue));
    if (properties.maxValue) x.push(vg.isLte(properties.maxValue));
    return x.length > 0 ? vg.pipe([toBigint, ...x], { returnIndex: 0 }) : toBigint;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    return this[DECODER](properties);
  }
}
