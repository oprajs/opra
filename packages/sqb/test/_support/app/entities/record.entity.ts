import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType, PrimaryKey } from '@sqb/connect';

@ComplexType()
export class Record {

  @ApiField()
  @Column({
    dataType: DataType.INTEGER,
    notNull: true
  })
  @PrimaryKey()
  id: number;

  @ApiField()
  @Column()
  createdAt: Date;

  @ApiField()
  @Column()
  updatedAt?: Date;

}
