import { ComplexType, Expose } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customer_notes')
export class CustomerNote extends Record {

  @Expose()
  @Column()
  customerId: number;

  @Expose()
  @Column()
  title: string;

  @Expose()
  @Column()
  text: string;

}
