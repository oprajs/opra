import type { OpraFilter } from '../../filter/index.js';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Field } from '../data-type/field.interface';
import type { Operation, ResourceBase } from './resource.interface.js';

export interface Collection extends ResourceBase {
  kind: Collection.Kind,
  type: DataType.Name;
  primaryKey: Field.Name | Field.Name[];
  operations: Collection.Operations;
}

export namespace Collection {
  export const Kind = 'Collection';
  export type Kind = 'Collection';

  export type CreateOperation = Operation & _OperationInput & _OperationResponse;
  export type DeleteOperation = Operation;
  export type DeleteManyOperation = Operation & _OperationFilter;
  export type GetOperation = Operation & _OperationResponse;
  export type FindManyOperation = Operation & _OperationFilter & _OperationResponse & {
    sortFields?: string[];
    defaultSort?: string[];
  };
  export type UpdateOperation = Operation & _OperationInput & _OperationResponse;
  export type UpdateManyOperation = Operation & _OperationInput & _OperationFilter;

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
