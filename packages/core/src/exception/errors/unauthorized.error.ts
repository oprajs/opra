import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 401 Unauthorized
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends ApiException {
  constructor(response?: ErrorResponse, cause?: Error) {
    super({
      message: translate('error:UNAUTHORIZED', 'Unauthorized'),
      severity: 'error',
      code: 'UNAUTHORIZED',
      ...response
    }, cause);
    this.status = HttpStatus.UNAUTHORIZED;
  }
}
