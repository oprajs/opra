import { CollectionResource, OpraResource, OprCollectionResource } from '@opra/schema';
import { CollectionResourceController, IEntityService, JsonCollectionService } from '../../../../src/index.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprCollectionResource(CustomerNotes, {
  description: 'Customer notes resource',
  keyFields: 'id'
})
export class CustomerNotesResource extends CollectionResourceController<CustomerNotes> {

  customersNotesService: JsonCollectionService<CustomerNotes>;

  deleteMany;

  init(resource: OpraResource) {
    this.customersNotesService = new JsonCollectionService<CustomerNotes>(resource as CollectionResource,
        {resourceName: 'CustomerNotes', data: []});
  }

  getService(): IEntityService {
    return this.customersNotesService;
  }
}
