import { ComplexType, Expose } from '@opra/common';
import { Column, DataType, PrimaryKey } from '@sqb/connect';

@ComplexType()
export class Record {

  @Expose()
  @Column({
    dataType: DataType.INTEGER,
    notNull: true
  })
  @PrimaryKey()
  id: number;

  @Expose()
  @Column()
  createdAt: Date;

  @Expose()
  @Column()
  updatedAt?: Date;

}
