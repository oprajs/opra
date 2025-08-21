import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { MQHeader } from './mq-header.interface.js';
import type { MQOperation } from './mq-operation.interface.js';

/**
 * Message Queue Controller
 * @interface MQController
 */
export interface MQController extends DataTypeContainer {
  kind: MQController.Kind;
  description?: string;
  operations?: Record<string, MQOperation>;
  headers?: MQHeader[];
}

/**
 *
 * @namespace MQController
 */

export namespace MQController {
  export type Name = string;
  export const Kind = 'MQController';
  export type Kind = 'MQController';
}
