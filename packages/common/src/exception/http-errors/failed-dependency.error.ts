import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 424 Failed Dependency
 * The request failed due to failure of a previous request.
 */
export class FailedDependencyError extends OpraHttpError {
  status = 424;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: 'The request failed due to failure of a previous request',
      code: 'FAILED_DEPENDENCY',
      ...issue,
    });
  }
}
