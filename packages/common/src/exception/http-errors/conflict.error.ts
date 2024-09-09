import { translate } from '../../i18n/index.js';
import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 409 Conflict
 * This response is sent when a request conflicts with the current state of the server.
 */
export class ConflictError extends OpraHttpError {
  status = 409;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:CONFLICT', 'Conflict'),
      code: 'CONFLICT',
      ...issue,
    });
  }
}
