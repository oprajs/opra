import { ApiField, ComplexType } from '@opra/common';

@ComplexType()
export class Photos {

  @ApiField()
  id: number;

  @ApiField()
  name: string;

  @ApiField()
  description: string;

  @ApiField()
  views: number;
}
