import { StrictOmit } from 'ts-gems';
import type { OpraFilter } from '../../filter/index.js';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Field } from '../data-type/field.interface';
import type { Endpoint } from './endpoint.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Collection extends StrictOmit<ResourceBase, 'kind'> {
  kind: Collection.Kind;
  type: DataType.Name;
  primaryKey: Field.Name | Field.Name[];
  operations?: Collection.Operations;
}

export namespace Collection {
  export const Kind = 'Collection';
  export type Kind = 'Collection';

  export interface Operations {
    create?: Operations.Create;
    delete?: Operations.Delete;
    deleteMany?: Operations.DeleteMany;
    findMany?: Operations.FindMany;
    get?: Operations.Get;
    update?: Operations.Update;
    updateMany?: Operations.UpdateMany;
    [key: string]: Endpoint | undefined;
  }

  export namespace Operations {
    export type Create = Endpoint & _InputOptions & _OutputOptions;
    export type Delete = Endpoint;
    export type DeleteMany = Endpoint & _FilterOption;
    export type Get = Endpoint & _OutputOptions;
    export type FindMany = Endpoint & _FilterOption & _OutputOptions & {
      sortFields?: string[];
      defaultSort?: string[];
    };
    export type Update = Endpoint & _InputOptions & _OutputOptions;
    export type UpdateMany = Endpoint & _FilterOption & _InputOptions & _OutputOptions;
  }

}

interface _FilterOption {
  filters?: {
    field: Field.QualifiedName;
    operators?: OpraFilter.ComparisonOperator[];
    notes?: string;
  }[]
}

interface _InputOptions {
  inputMaxContentSize?: number | string;
  inputPick?: Field.QualifiedName[];
  inputOmit?: Field.QualifiedName[];

}

interface _OutputOptions {
  outputPick?: Field.QualifiedName[];
  outputOmit?: Field.QualifiedName[];
}
