import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customer_notes')
export class CustomerNote extends Record {

  @ApiField()
  @Column()
  customerId: number;

  @ApiField()
  @Column()
  title: string;

  @ApiField()
  @Column()
  text: string;

}
