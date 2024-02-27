import type { Endpoint } from './endpoint.interface.js';
import type { RequestBody } from './request-body.interface.js';

/**
 * @interface Operation
 */
export interface Operation extends Endpoint {
  kind: Operation.Kind;
  method: Operation.Method;
  requestBody?: RequestBody;
  composition?: string;
  compositionOptions?: Record<string, any>;
}

/**
 * @namespace Operation
 */
export namespace Operation {
  export const Kind = 'Operation';
  export type Kind = typeof Kind;

  export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

}

