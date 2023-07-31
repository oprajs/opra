import { OpraFilter } from '@opra/common';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Field } from '../data-type/field.interface';
import type { Endpoint } from './endpoint.interface.js';
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

  export type CreateOperation = Endpoint & _OperationInput & _OperationResponse;
  export type DeleteOperation = Endpoint;
  export type DeleteManyOperation = Endpoint & _OperationFilter;
  export type GetOperation = Endpoint & _OperationResponse;
  export type FindManyOperation = Endpoint & _OperationFilter & _OperationResponse & {
    sortFields?: string[];
    defaultSort?: string[];
  };
  export type UpdateOperation = Endpoint & _OperationInput & _OperationResponse;
  export type UpdateManyOperation = Endpoint & _OperationInput & _OperationFilter;

  export interface Operations {
    create?: CreateOperation;
    delete?: DeleteOperation;
    get?: GetOperation;
    update?: UpdateOperation;
    deleteMany?: DeleteManyOperation;
    findMany?: FindManyOperation;
    updateMany?: UpdateManyOperation;
  }
}

interface _OperationFilter {
  filters?: { field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] }[]
}

interface _OperationInput {
  input?: {
    maxContentSize?: number | string;
    pick?: Field.QualifiedName[];
    omit?: Field.QualifiedName[];
  }
}

interface _OperationResponse {
  response?: {
    pick?: Field.QualifiedName[];
    omit?: Field.QualifiedName[];
  }
}
