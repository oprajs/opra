import type { DataType } from '../data-type/data-type.interface.js';
import type { Collection } from './collection.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Singleton extends ResourceBase {
  kind: Singleton.Kind,
  type: DataType.Name;
  endpoints: Singleton.Endpoints;
}

export namespace Singleton {
  export const Kind = 'Singleton';
  export type Kind = 'Singleton';

  export type CreateEndpoint = Collection.CreateEndpoint;
  export type DeleteEndpoint = Collection.DeleteEndpoint;
  export type GetEndpoint = Collection.GetEndpoint;
  export type UpdateEndpoint = Collection.UpdateEndpoint;

  export interface Endpoints {
    create?: CreateEndpoint;
    delete?: DeleteEndpoint;
    get?: GetEndpoint;
    update?: UpdateEndpoint;
  }
}
