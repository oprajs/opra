import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { OpraSchema } from '../../opra-schema.js';
import { OpraService } from '../opra-service.js';
import { OpraResource } from './base-resource.js';
import { EntityResource } from './entity-resource.js';

export class ContainerResource extends OpraResource implements IResourceContainer {
  declare readonly metadata: OpraSchema.ContainerResource;

  constructor(service: OpraService, metadata: OpraSchema.ContainerResource) {
    super(service, metadata);
  }

  getResource<T extends OpraResource>(name: string): T {
    const t = this.metadata.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResource {
    const t = this.getResource(name);
    if (!(t instanceof EntityResource))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

}
