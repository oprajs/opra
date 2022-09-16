import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 403 Forbidden
 * The client does not have access rights to the content; that is, it is unauthorized,
 * so the server is refusing to give the requested resource. Unlike 401 Unauthorized,
 * the client's identity is known to the server.
 */
export class ForbiddenError extends ApiException {
  constructor(response?: ErrorResponse, cause?: Error) {
    super({
      message: translate('error:FORBIDDEN', 'Forbidden'),
      severity: 'error',
      code: 'FORBIDDEN',
      ...response
    }, cause);
    this.status = HttpStatus.FORBIDDEN;
  }
}
