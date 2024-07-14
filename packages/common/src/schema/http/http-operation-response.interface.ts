import type { HttpMediaType } from './http-media-type.interface.js';
import type { HttpParameter } from './http-parameter.interface.js';
import type { HttpStatusRange } from './http-status-range.interface.js';

/**
 *
 * @interface HttpOperationResponse
 */
export interface HttpOperationResponse extends HttpMediaType {
  /**
   * Http status code or code range.
   * @example 200
   * @example [401,402,403]
   * @example {start: 400, end: 403}
   */
  statusCode: number | HttpStatusRange | (number | HttpStatusRange)[];
  /**
   * Returned parameters for this response. etc. headers or cookies
   */
  parameters?: HttpParameter[];

  /**
   * Determines if the response object is partial
   */
  partial?: boolean | 'deep';
}
