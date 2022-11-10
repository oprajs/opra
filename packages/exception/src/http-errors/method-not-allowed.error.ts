import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 405 Method Not Allowed
 * The request method is known by the server but is not supported by the target resource.
 * For example, an API may not allow calling DELETE to remove a resource.
 */
export class MethodNotAllowedError extends OpraException {
  status = 405;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:METHOD_NOT_ALLOWED', 'Method not allowed'),
      severity: 'error',
      code: 'METHOD_NOT_ALLOWED',
      ...issue
    });
  }

}