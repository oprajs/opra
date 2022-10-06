import { OpraResource } from '../implementation/resource/base-resource.js';
import { EntityResource } from '../implementation/resource/entity-resource.js';

export interface IResourceContainer {
  getResource<T extends OpraResource>(name: string): T;

  getEntityResource(name: string): EntityResource;
}
