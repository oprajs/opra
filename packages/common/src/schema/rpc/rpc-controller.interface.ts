import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { RpcHeader } from './rpc-header.interface.js';
import type { RpcOperation } from './rpc-operation.interface.js';

/**
 * RPC Controller
 * @interface RpcController
 */
export interface RpcController extends DataTypeContainer {
  kind: RpcController.Kind;
  description?: string;
  operations?: Record<string, RpcOperation>;
  headers?: RpcHeader[];
}

/**
 *
 * @namespace RpcController
 */

export namespace RpcController {
  export type Name = string;
  export const Kind = 'RpcController';
  export type Kind = 'RpcController';
}
