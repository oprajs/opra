import type { StrictOmit } from 'ts-gems';
import type { Endpoint } from './endpoint.interface.js';
import type { Resource, ResourceBase } from './resource.interface';

export interface Container extends StrictOmit<ResourceBase, 'kind' | 'operations'> {
  kind: Container.Kind;
  resources?: Record<Resource.Name, Resource>;
  actions?: Record<string, Endpoint | undefined>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
