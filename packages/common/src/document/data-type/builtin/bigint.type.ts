import { isBigint, isString, vg } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'BigInt number',
  decoder: isBigint,
  encoder: vg.pipe(isBigint, isString)
})
export class BigintType {

}
