import { OprEntityResource } from '../../../../src/index.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprEntityResource(CustomerNotes, {
  description: 'Customer notes resource',
  keyFields: 'id'
})
export class CustomerNotesResource {

  get() {
    //
  }

  search() {
    //
  }
}
