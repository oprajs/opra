import { OprEntity, OprField } from '@opra/schema';

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
