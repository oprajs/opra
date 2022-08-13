import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums';
import { ApiException, ErrorResponse } from '../api-exception';

/**
 * 500 Internal Server Error
 * The server has encountered a situation it does not know how to handle.
 */
export class InternalServerError extends ApiException {
  constructor(response?: ErrorResponse) {
    super({
      message: translate('error:INTERNAL_SERVER_ERROR', 'Internal server error'),
      severity: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      ...response
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
