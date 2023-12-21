import { isNumber } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Both Integer as well as Floating-Point numbers',
  decoder: isNumber,
  encoder: isNumber
})
export class NumberType {

}
