import type { Collection } from './collection.interface.js';
import type { Container } from './container.interface.js';
import type { Singleton } from './singleton.interface.js';

export type Resource = Collection | Singleton | Container;

export namespace Resource {
  export type Name = string;
  export type Kind = Collection.Kind | Singleton.Kind | Container.Kind;
}

export interface ResourceBase {
  kind: string;
  description?: string;
}
