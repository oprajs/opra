import type { HttpServerResponse } from './http/http-server-response.js';

export interface Response {
  /**
   * Result value
   */
  value?: any;

  /**
   * List of errors
   */
  errors: any[];

  /**
   *
   */
  continueOnError?: boolean;

  /**
   * Total count of matched entities. (Used in "search" endpoint with "count" option
   */
  totalMatches?: number;

  switchToHttp(): HttpServerResponse;

  switchToWs(): never;

  switchToRpc(): never;
}
