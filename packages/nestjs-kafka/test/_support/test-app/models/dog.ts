import { ApiField, ComplexType } from '@opra/common';

@ComplexType()
export class Dog {
  @ApiField()
  declare id: number;

  @ApiField()
  declare name: string;

  @ApiField()
  declare age: number;
}
