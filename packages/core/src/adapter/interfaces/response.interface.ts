import { HttpResponseMessage } from '@opra/common';

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

  switchToHttp(): HttpResponseMessage;

  switchToWs(): never;

  switchToRpc(): never;
}