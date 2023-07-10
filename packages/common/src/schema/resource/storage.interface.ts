import type { Endpoint } from './endpoint.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Storage extends ResourceBase {
  kind: Storage.Kind,
  operations: Storage.Operations;
}

export namespace Storage {
  export const Kind = 'Storage';
  export type Kind = 'Storage';

  export type DeleteOperation = Endpoint;
  export type GetOperation = Endpoint;
  export type PutOperation = Endpoint & {

  };

  export interface Operations {
    delete?: DeleteOperation;
    get?: GetOperation;
    put?: PutOperation;
  }
}
