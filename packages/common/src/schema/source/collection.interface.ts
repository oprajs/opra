import type { OpraFilter } from '../../filter/index.js';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Field } from '../data-type/field.interface';
import type { Endpoint, SourceBase } from './source.interface.js';

export interface Collection extends SourceBase {
  kind: Collection.Kind,
  type: DataType.Name;
  primaryKey: Field.Name | Field.Name[];
  operations: Collection.Operations;
}

export namespace Collection {
  export const Kind = 'Collection';
  export type Kind = 'Collection';

  export type CreateEndpoint = Endpoint & _EndpointInput & _EndpointResponse;
  export type DeleteEndpoint = Endpoint;
  export type DeleteManyEndpoint = Endpoint & _EndpointFilter;
  export type GetEndpoint = Endpoint & _EndpointResponse;
  export type FindManyEndpoint = Endpoint & _EndpointFilter & _EndpointResponse & {
    sortFields?: string[];
    defaultSort?: string[];
  };
  export type UpdateEndpoint = Endpoint & _EndpointInput & _EndpointResponse;
  export type UpdateManyEndpoint = Endpoint & _EndpointInput & _EndpointFilter;

  export interface Operations {
    create?: CreateEndpoint;
    delete?: DeleteEndpoint;
    get?: GetEndpoint;
    update?: UpdateEndpoint;
    deleteMany?: DeleteManyEndpoint;
    findMany?: FindManyEndpoint;
    updateMany?: UpdateManyEndpoint;
  }
}

interface _EndpointFilter {
  filters?: { field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] }[]
}

interface _EndpointInput {
  input?: {
    maxContentSize?: number | string;
    pick?: Field.QualifiedName[];
    omit?: Field.QualifiedName[];
  }
}

interface _EndpointResponse {
  response?: {
    pick?: Field.QualifiedName[];
    omit?: Field.QualifiedName[];
  }
}
