import { DataType } from '../data-type/data-type.interface.js';
import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { MsgHeader } from './msg-header.interface.js';

/**
 * @interface MsgOperation
 */
export interface MsgOperation extends DataTypeContainer {
  kind: MsgOperation.Kind;
  description?: string;
  channel: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: MsgHeader[];
  response?: MsgOperationResponse;
}

export interface MsgOperationResponse {
  description?: string;
  channel?: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: MsgHeader[];
}

export namespace MsgOperation {
  export const Kind = 'MsgOperation';
  export type Kind = 'MsgOperation';
}
