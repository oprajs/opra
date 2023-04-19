import type { ComparisonOperator } from '../../filter/index.js';
import type { ComplexField } from '../data-type/compex-field.interface.js';

export interface Endpoint {
  description?: string;
  handler?: Endpoint.MethodHandler;
}

export namespace Endpoint {
  export type MethodHandler = (...args: any[]) => any | Promise<any>;
}

export namespace _Operation {
  export interface Filter {
    filters?: { field: ComplexField.QualifiedName, operators?: ComparisonOperator[] }[]
  }

  export interface InputPickOmit {
    input?: {
      pick?: ComplexField.QualifiedName[];
      omit?: ComplexField.QualifiedName[];
    }
  }

  export interface ResponsePickOmit {
    response?: {
      pick?: ComplexField.QualifiedName[];
      omit?: ComplexField.QualifiedName[];
    }
  }
}
