import { MixinType, OprComplexType, OprField } from '@opra/common';
import { Note } from '../types/note.type.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Notes'
})
export class CustomerNotes extends MixinType(Record, Note) {

  @OprField()
  customerId: number;
}
