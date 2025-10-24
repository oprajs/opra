import { DataType } from '../data-type/data-type.interface.js';
import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { MQHeader } from './mq-header.interface.js';

/**
 * @interface MQOperation
 */
export interface MQOperation extends DataTypeContainer {
  kind: MQOperation.Kind;
  description?: string;
  channel: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: MQHeader[];
  response?: MQOperationResponse;
}

export interface MQOperationResponse {
  description?: string;
  channel?: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
  keyType?: string | DataType;
  headers?: MQHeader[];
}

export namespace MQOperation {
  export const Kind = 'MQOperation';
  export type Kind = 'MQOperation';
}
