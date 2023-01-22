import '@opra/sqb';
import { Column, DataType } from '@sqb/connect';
import { OprComplexType, OprField } from '../../../../../src/index.js';

@OprComplexType({
  abstract: true,
  description: 'Customer information'
})
export class Record {

  @Column(DataType.INTEGER)
  @OprField()
  id: number;

  @Column()
  @OprField()
  deleted?: boolean;

}
