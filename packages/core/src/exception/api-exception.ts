import { HttpStatus } from '../enums/index.js';

const nodeEnv = process.env.NODE_ENV || '';
export type IssueSeverity = 'error' | 'fatal' | 'warning' | 'info';

export interface ErrorResponse {

  /**
   * Error message
   */
  message: string;

  /**
   * Error or warning code
   */
  code?: string;

  /**
   * Severity of the issue
   */
  severity?: IssueSeverity;

  /**
   * Additional details about the error
   */
  details?: string;

  /**
   * Additional diagnostic information about the issue. Error stack etc.
   */
  diagnostics?: string;

  [index: string]: any;
}

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class ApiException extends Error {

  readonly originalError?: Error;
  response: ErrorResponse;
  status: number;

  constructor(response: string | ErrorResponse | Error, status?: number) {
    super();
    this._initName();
    this.setStatus(status || HttpStatus.INTERNAL_SERVER_ERROR);
    if (response instanceof Error)
      this.originalError = response;
    this._initResponse(response);
  }

  setStatus(status: number | HttpStatus): this {
    this.status = status;
    return this;
  }

  protected _initName(): void {
    this.name = this.constructor.name;
  }

  protected _initResponse(init: string | ErrorResponse | Error) {
    if (init && typeof init === 'object') {
      const x = init as any;
      if (typeof x.status === 'number')
        this.setStatus(x.status);
      else if (typeof x.getStatus === 'function')
        this.setStatus(x.getStatus());
    }

    if (typeof init === 'object') {
      const x = init as any;
      this.response = {
        message: x.message || x.details || ('' + init),
      }
      if (init instanceof Error && nodeEnv === 'dev' || nodeEnv === 'development')
        this.response.diagnostics = init.stack;
      Object.assign(this.response, init);
    } else {
      this.response = {
        message: '' + init,
      }
    }
    if (!this.response.severity)
      this.response.severity = !this.status || this.status >= 500 ? 'error' : 'fatal'
  }

  static wrap(response: string | ErrorResponse | Error, status?: number): ApiException {
    return response instanceof ApiException ? response : new ApiException(response, status);
  }

}
