import type { DataType } from '../data-type/data-type.interface.js';
import type { Resource, ResourceBase } from './resource.interface';

export interface Container extends ResourceBase<Container.Kind> {
  types?: Record<DataType.Name, DataType>;
  resources?: Record<Resource.Name, Resource>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
