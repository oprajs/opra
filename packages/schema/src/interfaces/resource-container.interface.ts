import { CollectionResourceInfo } from '../implementation/resource/collection-resource-info.js';
import { ResourceInfo } from '../implementation/resource/resource-info.js';
import { SingletonResourceInfo } from '../implementation/resource/singleton-resource-info.js';

export interface IResourceContainer {
  getResource<T extends ResourceInfo>(name: string): T;

  getCollectionResource(name: string): CollectionResourceInfo;

  getSingletonResource(name: string): SingletonResourceInfo;
}
