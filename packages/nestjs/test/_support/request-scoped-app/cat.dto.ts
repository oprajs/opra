import { OprComplexType, OprField } from '@opra/schema';

@OprComplexType()
export class Cat {

  @OprField()
  id: number;

  @OprField()
  name: string;

  @OprField()
  age: number;
}
