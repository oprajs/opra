import { isUUID } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Universal Unique Identifier (UUID) value',
  decoder: isUUID(),
  encoder: isUUID()
})
export class UuidType {

}
