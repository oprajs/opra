import type { Collection } from './collection.interface.js';
import type { Container } from './container.interface.js';
import type { Endpoint } from './endpoint.interface.js';
import type { Singleton } from './singleton.interface.js';
import type { Storage } from './storage.interface.js';

export type AnyResource = Collection | Singleton | Storage | Container;

export namespace Resource {
  export type Name = string;
  export type Kind = Collection.Kind | Singleton.Kind | Storage.Kind | Container.Kind;
}

export interface Resource {
  kind: string;
  description?: string;
  actions?: Record<string, Endpoint | undefined>;
}
