import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 405 Method Not Allowed
 * The request method is known by the server but is not supported by the target resource.
 * For example, an API may not allow calling DELETE to remove a resource.
 */
export class MethodNotAllowedError extends OpraException {
  status = 405;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:METHOD_NOT_ALLOWED', 'Method not allowed'),
      code: 'METHOD_NOT_ALLOWED',
      ...issue
    });
  }

}
