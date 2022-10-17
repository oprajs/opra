import { Column, Entity } from '@sqb/connect';
import { MixinType, OprComplexType, OprField } from '../../../../src/index.js';
import { Note } from '../types/note.type.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Customer notes entity',
})
@Entity()
export class CustomerNotes extends MixinType(Record, Note) {

  @OprField()
  @Column({notNull: true})
  customerId: number;

}
