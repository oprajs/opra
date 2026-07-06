import type { ErrorIssue } from '@opra/common';

/**
 * Error class for OPRA client operations.
 *
 * @class ClientError
 */
export class ClientError extends Error {
  /** Detailed error issues */
  public issues: ErrorIssue[];
  /** HTTP status code */
  public status?: number;

  /**
   * Creates a new instance of ClientError.
   *
   * @param init Initialization parameters.
   * @param cause The underlying error cause.
   */
  constructor(
    init: {
      message: string;
      issues?: ErrorIssue[];
      status?: number;
    },
    public cause?: Error,
  ) {
    super(init.message);
    this.issues = init.issues || [];
    this.status = init.status;
    if (cause) {
      this.cause = cause;
      if (cause.stack) this.stack = cause.stack;
    }
  }
}
