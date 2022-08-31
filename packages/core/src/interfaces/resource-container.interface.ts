import { EntityResourceController } from '../implementation/resource/entity-resource-controller.js';
import { ResourceController } from '../implementation/resource/resource-controller.js';

export interface ResourceContainer {
  getResource<T extends ResourceController>(name: string): T;
  getEntityResource(name: string): EntityResourceController;
}
