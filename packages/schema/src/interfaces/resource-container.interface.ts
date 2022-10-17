import { OpraResource } from '../implementation/resource/base-resource.js';
import { CollectionResource } from '../implementation/resource/collection-resource.js';

export interface IResourceContainer {
  getResource<T extends OpraResource>(name: string): T;

  getCollectionResource(name: string): CollectionResource;
}
