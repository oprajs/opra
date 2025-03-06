import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 405 Method Not Allowed
 * The request method is known by the server but is not supported by the target resource.
 * For example, an API may not allow calling DELETE to remove a resource.
 */
export class MethodNotAllowedError extends OpraHttpError {
  status = 405;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      ...issue,
    });
  }
}
