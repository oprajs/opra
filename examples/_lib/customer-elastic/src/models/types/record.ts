import { ApiField, ComplexType } from '@opra/common';
import { type PartialDTO } from 'ts-gems';

@ComplexType({
  abstract: true,
  description: 'Base Record schema',
  keyField: 'id',
})
export class Record {
  constructor(init?: PartialDTO<Record>) {
    Object.assign(this, init);
  }

  @ApiField()
  declare id: number;

  @ApiField()
  declare deleted?: boolean;

  @ApiField()
  declare createdAt: Date;

  @ApiField()
  declare updatedAt?: Date;
}
