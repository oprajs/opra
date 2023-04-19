import type { DataType } from '../data-type/data-type.interface.js';
import type { Field } from '../data-type/field.interface';
import type { _Operation, Endpoint } from './endpoint.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Collection extends ResourceBase {
  kind: Collection.Kind,
  type: DataType.Name;
  primaryKey: Field.Name | Field.Name[];
  operations: Collection.Operations;
}

export namespace Collection {
  export const Kind = 'Collection';
  export type Kind = 'Collection';

  export type CreateOperation = Endpoint & _Operation.InputPickOmit & _Operation.ResponsePickOmit;
  export type GetOperation = Endpoint & _Operation.ResponsePickOmit;
  export type DeleteOperation = Endpoint;
  export type DeleteManyOperation = Endpoint & _Operation.Filter;
  export type UpdateOperation = Endpoint & _Operation.InputPickOmit & _Operation.ResponsePickOmit;
  export type UpdateManyOperation = Endpoint & _Operation.InputPickOmit & _Operation.Filter;
  export type SearchOperation = Endpoint & _Operation.Filter & _Operation.ResponsePickOmit & {
    sortFields?: string[];
    defaultSort?: string[];
  };

  export interface Operations {
    create?: CreateOperation;
    delete?: DeleteOperation;
    deleteMany?: DeleteManyOperation;
    get?: GetOperation;
    update?: UpdateOperation;
    updateMany?: UpdateManyOperation;
    search?: SearchOperation;
  }
}
