import { ComplexField, ComplexType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customer_notes')
export class CustomerNote extends Record {

  @ComplexField()
  @Column()
  customerId: number;

  @ComplexField()
  @Column()
  title: string;

  @ComplexField()
  @Column()
  text: string;

}
