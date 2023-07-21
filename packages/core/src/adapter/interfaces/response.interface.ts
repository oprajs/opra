import { HttpServerResponse } from '../http/impl/http-server-response.js';

export interface Response {
  /**
   * Result value
   */
  value?: any;

  /**
   * List of errors
   */
  errors: Error[];

  /**
   *
   */
  continueOnError?: boolean;

  /**
   * Total count of matched entities. (Used in "search" operation with "count" option
   */
  count?: number;

  switchToHttp(): HttpServerResponse;

  switchToWs(): never;

  switchToRpc(): never;
}
