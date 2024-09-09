import { ApiField, ComplexType } from '@opra/common';
import { Column, PrimaryKey } from '@sqb/connect';
import { type PartialDTO } from 'ts-gems';

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
  declare _id: number;

  @ApiField()
  @Column()
  declare deleted?: boolean;

  @ApiField()
  @Column()
  declare createdAt: Date;

  @ApiField()
  @Column()
  declare updatedAt?: Date;
}
