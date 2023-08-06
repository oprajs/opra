import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  abstract: true,
  description: 'Base Record schema'
})
export class Record {

  @ApiField()
  _id: number;

  @ApiField()
  deleted?: boolean;

}
