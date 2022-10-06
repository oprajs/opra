import { OprEntityResource } from '@opra/schema';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprEntityResource(CustomerNotes, {
  description: 'Customer notes resource',
})
export class CustomerNotesResource {

  get() {
    //
  }

  search() {
    //
  }
}
