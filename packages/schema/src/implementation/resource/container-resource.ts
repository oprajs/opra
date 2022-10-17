import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { OpraSchema } from '../../opra-schema.js';
import { OpraApi } from '../opra-api.js';
import { OpraResource } from './base-resource.js';
import { CollectionResource } from './collection-resource.js';

export class ContainerResource extends OpraResource implements IResourceContainer {
  declare readonly metadata: OpraSchema.ContainerResource;

  constructor(service: OpraApi, metadata: OpraSchema.ContainerResource) {
    super(service, metadata);
  }

  getResource<T extends OpraResource>(name: string): T {
    const t = this.metadata.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getCollectionResource(name: string): CollectionResource {
    const t = this.getResource(name);
    if (!(t instanceof CollectionResource))
      throw new Error(`"${name}" is not a Collection Resource`);
    return t;
  }

}
