import { DataType } from '../data-type/data-type.interface.js';
import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { RpcHeader } from './rpc-header.interface.js';

/**
 * @interface RpcOperation
 */
export interface RpcOperation extends DataTypeContainer {
  kind: RpcOperation.Kind;
  description?: string;
  channel: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: RpcHeader[];
  response?: RpcOperationResponse;
}

export interface RpcOperationResponse {
  description?: string;
  channel?: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: RpcHeader[];
}

export namespace RpcOperation {
  export const Kind = 'RpcOperation';
  export type Kind = 'RpcOperation';
}
