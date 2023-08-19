import type { DataType } from '../data-type/data-type.interface.js';
import type { Resource, ResourceBase } from './resource.interface.js';

export interface Container extends ResourceBase {
  kind: Container.Kind;
  types?: Record<DataType.Name, DataType>;
  sources?: Record<Resource.Name, Resource>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
