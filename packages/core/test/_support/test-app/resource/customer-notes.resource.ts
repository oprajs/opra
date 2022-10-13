import { EntityResource, OpraResource, OprEntityResource } from '@opra/schema';
import { EntityResourceController, IEntityService, JsonCollectionService } from '../../../../src/index.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprEntityResource(CustomerNotes, {
  description: 'Customer notes resource',
  keyFields: 'id'
})
export class CustomerNotesResource extends EntityResourceController<CustomerNotes> {

  customersNotesService: JsonCollectionService<CustomerNotes>;

  deleteMany;

  init(resource: OpraResource) {
    this.customersNotesService = new JsonCollectionService<CustomerNotes>(resource as EntityResource,
        {resourceName: 'CustomerNotes', data: []});
  }

  getService(): IEntityService {
    return this.customersNotesService;
  }
}
