import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType, PrimaryKey } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Abstract Record Model'
})
export class Record {

  @Column(DataType.INTEGER)
  @ApiField()
  @PrimaryKey()
  id: number;

  @Column()
  @ApiField()
  deleted?: boolean;

}
