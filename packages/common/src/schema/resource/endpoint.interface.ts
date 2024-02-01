import type { HttpStatusCode } from '../../http/index';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Parameter } from './parameter.interface.js';

/**
 * @interface
 * @abstract
 */
export interface Endpoint<TOptions extends Object = any> {
  description?: string;
  headers?: Parameter[];
  parameters?: Parameter[];
  options?: TOptions;
  response?: Response;
}

export interface Operation extends Endpoint {
  kind: Operation.Kind;
  method: Operation.Method;
}

export namespace Operation {
  export const Kind = 'Operation';
  export type Kind = 'Operation';
  export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export interface Action extends Endpoint {
  kind: Action.Kind;
}

export namespace Action {
  export const Kind = 'Action';
  export type Kind = 'Action';
}


export interface Response {
  statusCode: HttpStatusCode;
  description?: string;
  type?: DataType.Name | DataType;
  contentType?: string;
  contentEncoding?: string;
  headers?: Parameter[];
}
