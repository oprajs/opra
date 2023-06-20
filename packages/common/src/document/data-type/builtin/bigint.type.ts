import { isBigint, isString, pipe } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'BigInt number',
  decoder: isBigint(),
  encoder: pipe(isBigint(), isString())
})
export class BigintType {

}
