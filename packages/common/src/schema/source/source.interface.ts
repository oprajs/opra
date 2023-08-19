import type { Collection } from './collection.interface.js';
import type { Container } from './container.interface.js';
import type { Singleton } from './singleton.interface.js';
import type { Storage } from './storage.interface';

export type Source = Collection | Singleton | Storage | Container;

export namespace Source {
  export type Name = string;
  export type Kind = Collection.Kind | Singleton.Kind | Storage.Kind | Container.Kind;
}

export interface SourceBase {
  kind: string;
  description?: string;
}

export interface Endpoint {
  description?: string;
}
