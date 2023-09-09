import type { DataType } from '../data-type/data-type.interface.js';
import type { Collection } from './collection.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Singleton extends ResourceBase<Singleton.Kind, Singleton.Operations> {
  type: DataType.Name;
}

export namespace Singleton {
  export const Kind = 'Singleton';
  export type Kind = 'Singleton';

  export interface Operations {
    create?: Operations.Create;
    delete?: Operations.Delete;
    get?: Operations.Get;
    update?: Operations.Update;
  }

  export namespace Operations {
    export type Create = Collection.Operations.Create;
    export type Delete = Collection.Operations.Delete;
    export type Get = Collection.Operations.Get;
    export type Update = Collection.Operations.Update;
  }

}
