import { PartialDTO } from 'ts-gems';
import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  abstract: true,
  description: 'Base Record schema',
  keyField: '_id',
})
export class Record {
  constructor(init?: PartialDTO<Record>) {
    Object.assign(this, init);
  }

  @ApiField()
  _id: number;

  @ApiField()
  deleted?: boolean;

  @ApiField()
  createdAt: Date;

  @ApiField()
  updatedAt?: Date;
}
