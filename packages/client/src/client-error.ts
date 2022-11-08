import { ErrorIssue } from '@opra/exception';

export class ClientError extends Error {
  public issues: ErrorIssue[];
  public status?: number;

  constructor(init: {
    message: string;
    issues?: ErrorIssue[];
    status?: number;
  }, public cause?: Error) {
    super(init.message);
    this.issues = init.issues || [];
    this.status = init.status;
    if (cause) {
      this.cause = cause;
      if (cause.stack)
        this.stack = cause.stack;
    }
  }
}
