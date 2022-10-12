import { i18n } from '@opra/i18n';
import { ErrorIssue } from './error-issue.js';

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class OpraException extends Error {
  protected _issue: ErrorIssue;
  status: number = 500;
  cause?: Error;

  constructor(issue?: string | Partial<ErrorIssue>, cause?: Error) {
    super('');
    this._initName();

    if (cause) {
      this.cause = cause;
      if (cause.stack)
        this.stack = cause.stack;
    }

    this._init(issue || cause || 'Unknown error');
    this.message = i18n.deep(this.issue.message);
  }

  get issue(): ErrorIssue {
    return this._issue;
  }

  setIssue(issue: Partial<ErrorIssue>) {
    this._issue = {
      message: 'Unknown error',
      severity: 'error',
      ...issue,
    }
  }

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  protected _initName(): void {
    this.name = this.constructor.name;
  }

  protected _init(issue: Error | Partial<ErrorIssue> | string) {
    if (issue instanceof Error) {
      if (typeof (issue as any).status === 'number')
        this.status = (issue as any).status;
      else if (typeof (issue as any).getStatus === 'function')
        this.status = (issue as any).getStatus();
      this.setIssue({message: issue.message});
    } else if (typeof issue === 'object') {
      this.setIssue(issue);
    } else {
      this.setIssue({message: String(issue)});
    }
  }

}
