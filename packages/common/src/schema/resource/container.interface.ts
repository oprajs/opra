import type { Resource, ResourceBase } from './resource.interface.js';

export interface Container extends ResourceBase {
  kind: Container.Kind,
  resources: Resource[];
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
