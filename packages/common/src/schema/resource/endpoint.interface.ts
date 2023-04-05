import type { ComparisonOperator } from '../../filter/index.js';
import type { ComplexType } from '../data-type/complex-type.interface.js';

export interface Endpoint {
  description?: string;
  handler?: Endpoint.MethodHandler;
}

export namespace Endpoint {
  export type MethodHandler = (...args: any[]) => any | Promise<any>;
}

export namespace _Operation {
  export interface Filter {
    filters?: { element: ComplexType.Element.qualifiedName, operators?: ComparisonOperator[] }[]
  }

  export interface InputPickOmit {
    input?: {
      pick?: ComplexType.Element.qualifiedName[];
      omit?: ComplexType.Element.qualifiedName[];
    }
  }

  export interface ResponsePickOmit {
    response?: {
      pick?: ComplexType.Element.qualifiedName[];
      omit?: ComplexType.Element.qualifiedName[];
    }
  }
}
