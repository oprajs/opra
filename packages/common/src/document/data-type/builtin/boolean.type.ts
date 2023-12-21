import { isBoolean } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Simple true/false value',
  decoder: isBoolean,
  encoder: isBoolean
})
export class BooleanType {

}
