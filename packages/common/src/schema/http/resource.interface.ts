import type { DocumentElement } from '../document-element.interface';
import type { Action } from './action.interface';
import type { Operation } from './operation.interface';
import type { KeyParameter } from './parameter.interface';

/**
 *
 * @interface Resource
 */
export interface Resource extends DocumentElement {
  kind: string;
  description?: string;
  keyParameter?: KeyParameter;
  endpoints?: Record<string, Action | Operation>;
  resources?: Record<string, Resource>;
}

/**
 *
 * @namespace Resource
 */

export namespace Resource {
  export type Name = string;
  export const Kind = 'HttpResource';
  export type Kind = 'HttpResource';

}
