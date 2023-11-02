import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 409 Conflict
 * This response is sent when a request conflicts with the current state of the server.
 */
export class ConflictError extends OpraException {
  status = 409;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:CONFLICT', 'Conflict'),
      code: 'CONFLICT',
      ...issue
    });
  }
}
