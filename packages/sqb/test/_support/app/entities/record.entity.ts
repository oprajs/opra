import { OprComplexType, OprField } from '@opra/schema';
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
  @Column({fieldName: 'created_at'})
  createdAt: Date;

  @OprField()
  @Column({fieldName: 'updated_at'})
  updatedAt?: Date;

}
