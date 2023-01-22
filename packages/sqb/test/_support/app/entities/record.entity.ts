import { OprComplexType, OprField } from '@opra/common';
import { Column, DataType, PrimaryKey } from '@sqb/connect';

@OprComplexType()
export class Record {

  @OprField()
  @Column({
    dataType: DataType.INTEGER,
    notNull: true
  })
  @PrimaryKey()
  id: number;

  @OprField()
  @Column()
  createdAt: Date;

  @OprField()
  @Column()
  updatedAt?: Date;

}
