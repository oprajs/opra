import { isString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A sequence of characters',
  decoder: isString,
  encoder: isString,
})
export class StringType {

}
