import { isObjectId, isString, pipe } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A MongoDB ObjectID value',
  decoder: isObjectId(),
  encoder: pipe(isObjectId(), isString())
})
export class ObjectIdType {
}
