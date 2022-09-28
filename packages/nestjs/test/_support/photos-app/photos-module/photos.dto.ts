import { OprEntity, OprField } from '@opra/schema';

@OprEntity({
  primaryKey: 'id'
})
export class Photos {

  @OprField()
  id: number;

  @OprField()
  name: string;

  @OprField()
  description: string;

  @OprField()
  views: number;
}
