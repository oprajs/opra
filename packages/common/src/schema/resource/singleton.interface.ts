import type { DataType } from '../data-type/data-type.interface.js';
import type { Collection } from './collection.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Singleton extends ResourceBase {
  kind: Singleton.Kind,
  type: DataType.Name;
  operations: Singleton.Operations;
}

export namespace Singleton {
  export const Kind = 'Singleton';
  export type Kind = 'Singleton';

  export type CreateOperation = Collection.CreateOperation;
  export type DeleteOperation = Collection.DeleteOperation;
  export type GetOperation = Collection.GetOperation;
  export type UpdateOperation = Collection.UpdateOperation;

  export interface Operations {
    create?: CreateOperation;
    delete?: DeleteOperation;
    get?: GetOperation;
    update?: UpdateOperation;
  }
}
