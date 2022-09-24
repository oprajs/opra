import { BaseControllerWrapper } from '../implementation/resource/base-controller-wrapper.js';
import { EntityControllerWrapper } from '../implementation/resource/entity-controller-wrapper.js';

export interface IResourceContainer {
  getResource<T extends BaseControllerWrapper>(name: string): T;

  getEntityResource(name: string): EntityControllerWrapper;
}
