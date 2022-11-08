import { CollectionResourceInfo, OprCollectionResource, ResourceInfo } from '@opra/schema';
import { JsonCollectionService, QueryContext } from '../../../../src/index.js';
import { ICollectionResource } from '../../../../src/interfaces/resource.interface.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprCollectionResource(CustomerNotes, {
  description: 'Customer notes resource',
  keyFields: 'id'
})
export class CustomerNotesResource implements ICollectionResource<CustomerNotes> {

  service: JsonCollectionService<CustomerNotes>;

  init(resource: ResourceInfo) {
    this.service = new JsonCollectionService<CustomerNotes>(resource as CollectionResourceInfo,
        {resourceName: 'CustomerNotes', data: []});
  }

  get(ctx: QueryContext, keyValue, options: any) {
    return this.service.get(keyValue, options);
  }

}
