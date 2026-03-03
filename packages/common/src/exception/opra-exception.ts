import { omitUndefined } from '@jsopen/objects';
import { i18n } from '../i18n/index.js';
import type { ErrorIssue } from './error-issue.js';
import { IssueSeverity } from './issue-severity.enum.js';

/**
 * Defines the base Opra exception, which is handled by the default Exceptions Handler.
 */
export class OpraException extends Error {
  cause?: Error;
  severity: IssueSeverity.Type = 'error';
  system?: string;
  code?: string;
  details?: any;

  constructor(issue: string | Partial<ErrorIssue> | Error, cause?: Error) {
    super('Unknown error');
    cause = cause || (issue instanceof Error ? issue : undefined);
    if (issue instanceof Error) cause = issue;
    // noinspection SuspiciousTypeOfGuard
    if (cause && cause instanceof Error) {
      this.cause = cause;
      if (cause.stack) this.stack = cause.stack;
    }
    if (typeof issue === 'string') this.initString(issue);
    else if (issue instanceof Error) this.initError(issue);
    else this.init(issue);
    this.message = this.message || this.constructor.name;
  }

  toString(): string {
    return i18n.deep(this.message);
  }

  toJSON(): ErrorIssue {
    return omitUndefined<ErrorIssue>(
      {
        message: this.message,
        severity: this.severity,
        system: this.system,
        code: this.code,
        details: this.details,
        stack: this.stack,
      },
      true,
    );
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
      code: this.constructor.name,
    });
  }

  protected initError(issue: Error) {
    const env = process.env.NODE_ENV;
    this.init({
      message: issue.message,
      severity: (issue as any).severity || 'error',
      code: (issue as any).code || issue.constructor.name,
      stack:
        env === 'dev' || env === 'development' || env === 'test'
          ? issue.stack
          : undefined,
    });
  }
}
