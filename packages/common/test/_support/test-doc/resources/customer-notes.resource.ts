import { Collection } from '@opra/common';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@Collection(CustomerNotes, {
  description: 'Customer notes resource',
  primaryKey: 'id'
})
export class CustomerNotesResource {

  @Collection.CreateOperation({
    input: {
      omit: ['id']
    }
  })
  create() {
    //
  }

  @Collection.GetOperation({
    response: {
      omit: ['id']
    }
  })
  get() {
    //
  }

  search() {
    //
  }
}
