import { OprEntity, OprField } from '@opra/schema';

@OprEntity({
  primaryKey: 'id'
})
export class Cat {

  @OprField()
  id: number;

  @OprField()
  name: string;

  @OprField()
  age: number;
}
