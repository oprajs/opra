import { HttpStatus } from '../enums/index.js';

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
  diagnostics?: string | string[];

  [index: string]: any;
}

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class ApiException extends Error {

  static stackAsDiagnostics: boolean = false;

  readonly originalError?: Error;
  response: ErrorResponse;
  status: number;
  cause?: Error;

  constructor(response: string | ErrorResponse | Error, cause?: Error) {
    super('');
    this._initName();
    if (cause)
      this.cause = cause;
    else if (response instanceof Error)
      this.cause = response;
    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
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
      if (!(init instanceof Error))
        Object.assign(this.response, init);
    } else {
      this.response = {
        message: '' + init,
      }
    }

    if (this.cause instanceof Error && ApiException.stackAsDiagnostics && this.cause.stack) {
      this.response.diagnostics = this.cause.stack.split('\n');
    }

    if (!this.response.severity)
      if (this.status >= 500)
        this.response.severity = 'fatal'
      else this.response.severity = 'error';
  }

  static wrap(response: string | ErrorResponse | Error): ApiException {
    return response instanceof ApiException
        ? response
        : new this(response, response instanceof Error ? response : undefined);
  }

}
