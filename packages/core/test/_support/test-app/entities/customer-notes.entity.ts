import { MixinType, OprEntity, OprField } from '@opra/schema';
import { Note } from '../types/note.type.js';
import { Record } from './record.entity.js';

@OprEntity({
  description: 'Notes'
})
export class CustomerNotes extends MixinType(Record, Note) {

  @OprField()
  customerId: number;
}
