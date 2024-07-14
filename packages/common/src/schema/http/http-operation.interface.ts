import type { DataTypeContainer } from '../data-type-container.interface.js';
import type { HttpMethod } from '../types.js';
import type { HttpOperationResponse } from './http-operation-response.interface.js';
import type { HttpParameter } from './http-parameter.interface.js';
import type { HttpRequestBody } from './http-request-body.interface.js';

/**
 * @interface HttpOperation
 */
export interface HttpOperation extends DataTypeContainer {
  kind: HttpOperation.Kind;
  method: HttpMethod;
  description?: string;
  path?: string;
  /**
   * Determines if the `path` will be joined or merged to parent path.
   */
  mergePath?: boolean;
  parameters?: HttpParameter[];
  responses?: HttpOperationResponse[];
  requestBody?: HttpRequestBody;
  composition?: string;
  compositionOptions?: Record<string, any>;
}

export namespace HttpOperation {
  export const Kind = 'HttpOperation';
  export type Kind = 'HttpOperation';
}
