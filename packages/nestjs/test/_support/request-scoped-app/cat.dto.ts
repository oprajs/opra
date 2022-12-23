import { OprComplexType, OprField } from '@opra/common';

@OprComplexType()
export class Cat {

  @OprField()
  id: number;

  @OprField()
  name: string;

  @OprField()
  age: number;
}
