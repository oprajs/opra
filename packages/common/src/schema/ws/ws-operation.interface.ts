import { DataType } from '../data-type/data-type.interface.js';
import type { DataTypeContainer } from '../data-type-container.interface.js';

/**
 * @interface WSOperation
 */
export interface WSOperation extends DataTypeContainer {
  kind: WSOperation.Kind;
  description?: string;
  channel: string | RegExp | (string | RegExp)[];
  payloadType: string | DataType;
}

export namespace WSOperation {
  export const Kind = 'WSOperation';
  export type Kind = 'WSOperation';
}
