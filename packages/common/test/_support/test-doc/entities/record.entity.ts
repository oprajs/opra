import { ComplexType, Expose } from '@opra/common';
import { Column, DataType } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Base Record schema'
})
export class Record {

  @Column(DataType.INTEGER)
  @Expose()
  id: number;

  @Column()
  @Expose()
  deleted?: boolean;

}
