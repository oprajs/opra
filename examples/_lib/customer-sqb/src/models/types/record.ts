import { ApiField, ComplexType } from '@opra/common';
import { Column, PrimaryKey } from '@sqb/connect';
import { PartialDTO } from 'ts-gems';

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
  @Column()
  @PrimaryKey()
  _id: number;

  @ApiField()
  @Column()
  deleted?: boolean;

  @ApiField()
  @Column()
  createdAt: Date;

  @ApiField()
  @Column()
  updatedAt?: Date;
}
