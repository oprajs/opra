import type { ComparisonOperator } from '../../filter/index.js';
import type { Field } from '../data-type/field.interface';

export interface Endpoint {
  description?: string;
  handler?: Endpoint.MethodHandler;
}

export namespace Endpoint {
  export type MethodHandler = (...args: any[]) => any | Promise<any>;
}

export namespace _Operation {
  export interface Filter {
    filters?: { field: Field.QualifiedName, operators?: ComparisonOperator[] }[]
  }

  export interface InputPickOmit {
    input?: {
      pick?: Field.QualifiedName[];
      omit?: Field.QualifiedName[];
    }
  }

  export interface ResponsePickOmit {
    response?: {
      pick?: Field.QualifiedName[];
      omit?: Field.QualifiedName[];
    }
  }
}
