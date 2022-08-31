import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 405 Method Not Allowed
 * The request method is known by the server but is not supported by the target resource.
 * For example, an API may not allow calling DELETE to remove a resource.
 */
export class MethodNotAllowedError extends ApiException {
  constructor(response?: ErrorResponse) {
    super({
      message: translate('error:METHOD_NOT_ALLOWED', 'Method Not Allowed'),
      severity: 'error',
      code: 'METHOD_NOT_ALLOWED',
      ...response
    }, HttpStatus.METHOD_NOT_ALLOWED);
  }
}
