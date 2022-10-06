import { i18n } from '@opra/i18n';

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
export class OpraException extends Error {

  static stackAsDiagnostics: boolean = false;

  response: ErrorResponse;
  status: number;
  cause?: Error;

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super('');
    this._initName();
    this.status = 500; // INTERNAL_SERVER_ERROR;

    cause = cause || (response instanceof Error ? response : undefined);
    if (cause)
      Object.defineProperty(this, 'cause', {enumerable: false, configurable: true, writable: true, value: cause});

    if (response instanceof Error)
      this._initErrorInstance(response);
    else if (typeof response === 'string')
      this._initResponse({message: response});
    else this._initResponse(response);

    this.message = i18n.deep(this.response.message);

    this.status = this.status || 500;

    if (!this.response.severity)
      if (this.status >= 500)
        this.response.severity = 'fatal'
      else this.response.severity = 'error';

    if (this.cause instanceof Error && this.cause.stack) {
      if (OpraException.stackAsDiagnostics)
        this.response.diagnostics = this.cause.stack.split('\n');
      this.stack = this.cause.stack;
    }
  }

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  protected _initName(): void {
    this.name = this.constructor.name;
  }

  protected _initErrorInstance(init: Error) {
    this._initResponse({
      message: init.message
    });
    if (typeof (init as any).status === 'number')
      this.setStatus((init as any).status);
    else if (typeof (init as any).getStatus === 'function')
      this.setStatus((init as any).getStatus());
  }

  protected _initResponse(response?: Partial<ErrorResponse>) {
    this.response = {
      message: 'Unknown error',
      ...response
    };
  }

  static wrap(response: string | ErrorResponse | Error): OpraException {
    if (response instanceof OpraException)
      return response;
    return new this(response, response instanceof Error ? response : undefined);
  }

}
