import { ComplexType, Expose } from '@opra/common';
import { Column, DataType } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Abstract Record Model'
})
export class Record {

  @Column(DataType.INTEGER)
  @Expose()
  id: number;

  @Column()
  @Expose()
  deleted?: boolean;

}
