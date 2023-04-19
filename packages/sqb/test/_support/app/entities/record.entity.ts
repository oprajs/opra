import { ComplexField, ComplexType } from '@opra/common';
import { Column, DataType, PrimaryKey } from '@sqb/connect';

@ComplexType()
export class Record {

  @ComplexField()
  @Column({
    dataType: DataType.INTEGER,
    notNull: true
  })
  @PrimaryKey()
  id: number;

  @ComplexField()
  @Column()
  createdAt: Date;

  @ComplexField()
  @Column()
  updatedAt?: Date;

}
