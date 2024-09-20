import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { MsgHeader } from './msg-header.interface.js';
import type { MsgOperation } from './msg-operation.interface.js';

/**
 * Message Controller
 * @interface MsgController
 */
export interface MsgController extends DataTypeContainer {
  kind: MsgController.Kind;
  description?: string;
  operations?: Record<string, MsgOperation>;
  headers?: MsgHeader[];
}

/**
 *
 * @namespace MsgController
 */

export namespace MsgController {
  export type Name = string;
  export const Kind = 'MsgController';
  export type Kind = 'MsgController';
}
