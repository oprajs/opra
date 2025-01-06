import type { ErrorIssue } from './error-issue.js';
import { OpraException } from './opra-exception.js';

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class OpraHttpError extends OpraException {
  status: number;

  constructor();
  constructor(issue: string | Partial<ErrorIssue> | Error, status?: number);
  constructor(
    issue: string | Partial<ErrorIssue>,
    cause?: Error,
    status?: number,
  );
  constructor(issue?: any, arg1?: Error | number, arg2?: number) {
    super(issue, arg1 instanceof Error ? arg1 : undefined);
    this.status = (typeof arg1 === 'number' ? arg1 : Number(arg2)) || 500;
  }

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  protected initError(issue: Error) {
    if (typeof (issue as any).status === 'number')
      this.status = (issue as any).status;
    else if (typeof (issue as any).getStatus === 'function')
      this.status = (issue as any).getStatus();
    super.initError(issue);
  }
}
