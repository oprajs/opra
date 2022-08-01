import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums';
import { ApiException, ErrorResponse } from '../api-exception';

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
