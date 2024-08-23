import { translate } from '../../i18n/index.js';
import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 500 Internal Server Error
 * The server has encountered a situation it does not know how to handle.
 */
export class InternalServerError extends OpraHttpError {
  status = 500;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:INTERNAL_SERVER_ERROR', 'Internal server error'),
      code: 'INTERNAL_SERVER_ERROR',
      severity: 'fatal',
      ...issue,
    });
  }
}
