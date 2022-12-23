import { OprComplexType, OprField } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Record } from './record.entity.js';

@OprComplexType()
@Entity('customer_notes')
export class CustomerNote extends Record {

  @OprField()
  @Column({fieldName: 'customer_id'})
  customerId: number;

  @OprField()
  @Column()
  title: string;

  @OprField()
  @Column()
  text: string;

}
