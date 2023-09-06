import { omitUndefined } from '../helpers/index.js';
import { i18n } from '../i18n/index.js';
import { ErrorIssue } from './error-issue.js';
import { IssueSeverity } from './issue-severity.enum.js';

const inDevelopment = (process.env.NODE_ENV || '').startsWith('dev');

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class OpraException extends Error {
  cause?: Error;
  status: number = 500;
  severity: IssueSeverity.Type;
  system?: string;
  code?: string;
  details?: any;

  constructor()
  constructor(issue: string | Partial<ErrorIssue> | Error, status?: number)
  constructor(issue: string | Partial<ErrorIssue>, cause?: Error, status?: number)

  constructor(issue?: any, arg1?: Error | number, arg2?: number) {
    super('Unknown error');
    let cause = arg1 && arg1 instanceof Error ? arg1 : undefined;
    this.status = (typeof arg1 === 'number' ? arg1 : Number(arg2)) || 500;
    if (issue instanceof Error)
      cause = issue;
    // noinspection SuspiciousTypeOfGuard
    if (cause && cause instanceof Error) {
      this.cause = cause;
      if (cause.stack)
        this.stack = cause.stack;
    }
    if (typeof issue === 'string')
      this.initString(issue);
    else if (issue instanceof Error)
      this.initError(issue);
    else
      this.init(issue);
    this.message = this.message || this.constructor.name;
  }

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  toString(): string {
    return i18n.deep(this.message);
  }

  toJSON(): ErrorIssue {
    return omitUndefined<ErrorIssue>({
      message: this.message,
      severity: this.severity,
      system: this.system,
      code: this.code,
      details: this.details,
      stack: inDevelopment ? this.stack?.split('\n') : undefined
    }, true);
  }

  protected init(issue?: Partial<ErrorIssue>) {
    this.message = issue?.message || this.constructor.name;
    this.severity = issue?.severity || 'error';
    if (issue) {
      this.system = issue.system;
      this.code = issue.code;
      this.details = issue.details;
    }
  }

  protected initString(issue: string) {
    this.init({
      message: String(issue || '') || this.constructor.name,
      severity: 'error',
      code: this.constructor.name
    })
  }

  protected initError(issue: Error) {
    if (typeof (issue as any).status === 'number')
      this.status = (issue as any).status;
    else if (typeof (issue as any).getStatus === 'function')
      this.status = (issue as any).getStatus();
    this.init({
      message: issue.message,
      severity: (issue as any).severity || 'error',
      code: (issue as any).code || (issue.constructor.name)
    });
  }

}
