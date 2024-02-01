import type { StrictOmit } from 'ts-gems';
import { AnyResource, Resource } from './resource.interface.js';

export interface Container extends StrictOmit<Resource, 'kind'> {
  kind: Container.Kind;
  resources?: Record<Resource.Name, AnyResource>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
