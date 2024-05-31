import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { HttpOperation } from './http-operation.interface';
import type { HttpParameter } from './http-parameter.interface';

/**
 *
 * @interface HttpController
 */
export interface HttpController extends DataTypeContainer {
  kind: HttpController.Kind;
  description?: string;
  path?: string;
  operations?: Record<string, HttpOperation>;
  children?: Record<string, HttpController>;
  parameters?: HttpParameter[];
}

/**
 *
 * @namespace HttpController
 */

export namespace HttpController {
  export type Name = string;
  export const Kind = 'HttpController';
  export type Kind = 'HttpController';
}
