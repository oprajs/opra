import { ApiField, ComplexType } from '@opra/common';

@ComplexType()
export class Cat {

  @ApiField()
  id: number;

  @ApiField()
  name: string;

  @ApiField()
  age: number;
}
