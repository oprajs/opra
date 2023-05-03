import type { DataType } from '../data-type/data-type.interface.js';
import type { _Operation, Endpoint } from './endpoint.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Singleton extends ResourceBase {
  kind: Singleton.Kind,
  type: DataType.Name;
  operations: Singleton.Operations;
}

export namespace Singleton {
  export const Kind = 'Singleton';
  export type Kind = 'Singleton';

  export type CreateOperation = Endpoint & _Operation.InputPickOmit & _Operation.ResponsePickOmit;
  export type DeleteOperation = Endpoint;
  export type GetOperation = Endpoint & _Operation.ResponsePickOmit;
  export type UpdateOperation = Endpoint & _Operation.InputPickOmit & _Operation.ResponsePickOmit;

  export interface Operations {
    create?: CreateOperation;
    delete?: DeleteOperation;
    get?: GetOperation;
    update?: UpdateOperation;
  }
}
