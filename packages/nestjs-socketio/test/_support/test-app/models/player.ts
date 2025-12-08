import { ApiField, ComplexType } from '@opra/common';

@ComplexType()
export class Player {
  @ApiField()
  declare id: number;

  @ApiField()
  declare name: string;

  @ApiField()
  declare age: number;
}
