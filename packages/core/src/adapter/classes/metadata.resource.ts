import { OprSingletonResource, SingletonResourceInfo } from '@opra/common';
import { ISingletonResource } from '../../interfaces/resource.interface.js';
import { JsonSingletonService } from '../../services/json-singleton-service.js';

@OprSingletonResource(Object, {
  name: '$metadata'
})
export class MetadataResource implements ISingletonResource<any> {
  service: JsonSingletonService<any>;

  init(resource: SingletonResourceInfo): void {
    this.service = new JsonSingletonService(resource.dataType, {
      data: resource.document.getMetadata(true)
    });
  }

  get() {
    return this.service.get();
  }
}
