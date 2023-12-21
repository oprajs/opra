import { isObjectId, isString, vg } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A MongoDB ObjectID value',
  decoder: isObjectId,
  encoder: vg.pipe(isObjectId, isString)
})
export class ObjectIdType {
}
