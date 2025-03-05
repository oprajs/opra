import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 422 Unprocessable Entity
 * The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends OpraHttpError {
  status = 422;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: 'Unprocessable entity',
      severity: 'error',
      code: 'UNPROCESSABLE_ENTITY',
      ...issue,
    });
  }
}
