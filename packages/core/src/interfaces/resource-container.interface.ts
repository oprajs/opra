import { EntityResourceHandler } from '../implementation/resource/entity-resource-handler.js';
import { ResourceHandler } from '../implementation/resource/resource-handler.js';

export interface IResourceContainer {
  getResource<T extends ResourceHandler>(name: string): T;
  getEntityResource(name: string): EntityResourceHandler;
}
