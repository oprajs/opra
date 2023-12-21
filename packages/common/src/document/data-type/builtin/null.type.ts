import { isNull } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Null value',
  decoder: isNull,
  encoder: isNull
})
export class NullType {
}
