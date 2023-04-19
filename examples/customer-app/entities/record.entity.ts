import { ComplexField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Abstract Record Model'
})
export class Record {

  @Column(DataType.INTEGER)
  @ComplexField()
  id: number;

  @Column()
  @ComplexField()
  deleted?: boolean;

}
