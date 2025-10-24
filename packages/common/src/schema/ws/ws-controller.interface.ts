import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { WSOperation } from './ws-operation.interface.js';

/**
 * WebSocket Controller
 * @interface WSController
 */
export interface WSController extends DataTypeContainer {
  kind: WSController.Kind;
  description?: string;
  operations?: Record<string, WSOperation>;
}

/**
 *
 * @namespace WSController
 */

export namespace WSController {
  export type Name = string;
  export const Kind = 'WSController';
  export type Kind = 'WSController';
}
