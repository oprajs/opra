import { isInteger } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An integer number',
  decoder: isInteger(),
  encoder: isInteger()
})
export class IntegerType {

}
