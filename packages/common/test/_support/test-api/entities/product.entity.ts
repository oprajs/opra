import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';
import { Record } from '../types/record.type.js';

@ComplexType({
  description: 'Product information'
})
@Entity('products')
export class Product extends Record {

  @PrimaryKey()
  @Column({notNull: true})
  _id: number;

  @ApiField()
  @Column({notNull: true})
  code: string;

  @ApiField()
  @Column({notNull: true})
  name: string;
}
