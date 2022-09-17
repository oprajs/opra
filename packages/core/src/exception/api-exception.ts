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

  response: ErrorResponse;
  status: number;
  cause?: Error;

  constructor(response: string | ErrorResponse | Error, cause?: Error) {
    super('');
    this._initName();
    if (cause)
      Object.defineProperty(this, 'cause', {enumerable: false, configurable: true, writable: true, value: cause});
    else if (response instanceof Error)
      Object.defineProperty(this, 'cause', {enumerable: false, configurable: true, writable: true, value: response});

    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
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

    if (this.cause instanceof Error && this.cause.stack) {
      if (ApiException.stackAsDiagnostics)
        this.response.diagnostics = this.cause.stack.split('\n');
      this.stack = this.cause.stack;
    }

    if (!this.response.severity)
      if (this.status >= 500)
        this.response.severity = 'fatal'
      else this.response.severity = 'error';
  }

  static wrap(response: string | ErrorResponse | Error): ApiException {
    if (response instanceof ApiException)
      return response;
    const out = new this(response, response instanceof Error ? response : undefined);
    if (response instanceof Error)
      out.stack = response.stack;
    return out;
  }

}
