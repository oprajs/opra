import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import type { OpraDocument } from '../opra-document.js';
import { CollectionResourceInfo } from './collection-resource-info.js';
import { ResourceInfo } from './resource-info.js';
import { SingletonResourceInfo } from './singleton-resource-info.js';

export class ContainerResourceInfo extends ResourceInfo implements IResourceContainer {
  declare readonly metadata: OpraSchema.ContainerResource;

  constructor(service: OpraDocument, name: string, metadata: OpraSchema.ContainerResource) {
    super(service, name, metadata);
  }

  getResource<T extends ResourceInfo>(name: string): T {
    const t = this.metadata.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getCollectionResource(name: string): CollectionResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof CollectionResourceInfo))
      throw new Error(`"${name}" is not a Collection Resource`);
    return t;
  }

  getSingletonResource(name: string): SingletonResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof SingletonResourceInfo))
      throw new Error(`"${name}" is not a SingletonResource`);
    return t;
  }

}
