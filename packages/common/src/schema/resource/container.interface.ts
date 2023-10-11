import type { StrictOmit } from 'ts-gems';
import type { Resource, ResourceBase } from './resource.interface';

export interface Container extends StrictOmit<ResourceBase, 'kind'> {
  kind: Container.Kind;
  resources?: Record<Resource.Name, Resource>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
