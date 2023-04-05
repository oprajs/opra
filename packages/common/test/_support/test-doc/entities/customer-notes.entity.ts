import '@opra/sqb';
import { ComplexType, Expose, UnionType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Note } from '../types/note.type.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer notes entity',
})
@Entity()
export class CustomerNotes extends UnionType(Record, Note) {

  @Expose()
  @Column({notNull: true})
  customerId: number;

}
