import { Endpoint } from './endpoint.interface.js';

/**
 *
 * @interface Action
 */
export interface Action extends Endpoint {
  kind: Action.Kind;
}


/**
 *
 * @namespace Action
 */
export namespace Action {
  export const Kind = 'Action';
  export type Kind = 'Action';
}

