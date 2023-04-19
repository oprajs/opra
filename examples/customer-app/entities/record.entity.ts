import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Abstract Record Model'
})
export class Record {

  @Column(DataType.INTEGER)
  @ApiField()
  id: number;

  @Column()
  @ApiField()
  deleted?: boolean;

}
