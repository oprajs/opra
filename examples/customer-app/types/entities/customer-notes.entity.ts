import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer notes entity',
})
@Entity({ tableName: 'customer_notes' })
export class CustomerNotes extends Record {
  @ApiField()
  @Column({ notNull: true, fieldName: 'customer_id' })
  customerId: number;

  @ApiField()
  @Column({ notNull: true })
  title: string;

  @ApiField()
  @Column()
  content: string;
}
