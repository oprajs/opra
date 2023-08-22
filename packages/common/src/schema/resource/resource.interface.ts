import type { Field } from '../data-type/field.interface.js';
import type { Collection } from './collection.interface.js';
import type { Container } from './container.interface.js';
import type { Singleton } from './singleton.interface.js';
import type { Storage } from './storage.interface';

export type Resource = Collection | Singleton | Storage | Container;

export namespace Resource {
  export type Name = string;
  export type Kind = Collection.Kind | Singleton.Kind | Storage.Kind | Container.Kind;
}

export interface ResourceBase {
  kind: string;
  description?: string;
  actions?: Record<Action.Name, Action>;
}

export interface Endpoint {
  description?: string;
}


export interface Action {
  parameters?: Record<Action.ParameterName, Action.Parameter>
}

export namespace Action {
  export type Name = string;

  export type ParameterName = string;

  export interface Parameter extends Pick<Field, 'type' | 'description' | 'isArray' | 'default' |
      'required' | 'deprecated' | 'examples'> {
  }
}
