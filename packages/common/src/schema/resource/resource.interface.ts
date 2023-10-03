import type { Collection } from './collection.interface.js';
import type { Container } from './container.interface.js';
import type { Endpoint } from './endpoint.interface.js';
import type { Singleton } from './singleton.interface.js';
import type { Storage } from './storage.interface.js';

export type Resource = Collection | Singleton | Storage | Container;

export namespace Resource {
  export type Name = string;
  export type Kind = Collection.Kind | Singleton.Kind | Storage.Kind | Container.Kind;
}

export interface ResourceBase {
  kind: string;
  description?: string;
  actions?: Record<string, Endpoint | undefined>;
}
