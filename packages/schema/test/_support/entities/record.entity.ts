import { OprEntity, OprField } from '../../../src/index.js';

@OprEntity({
  abstract: true,
  description: 'Customer information',
  primaryKey: 'id',
})
export class Record {

  @OprField({type: 'integer'})
  id: number;

  @OprField()
  deleted?: boolean;

}
