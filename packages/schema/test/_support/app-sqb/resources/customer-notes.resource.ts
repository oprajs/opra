import { OprCollectionResource } from '../../../../src/index.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprCollectionResource(CustomerNotes, {
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
