import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums';
import { ApiException, ErrorResponse } from '../api-exception';

export class NotFoundError extends ApiException {
  constructor(response?: ErrorResponse) {
    super({
      message: translate('error:NOT_FOUND', 'Not found'),
      severity: 'error',
      code: 'NOT_FOUND',
      ...response
    }, HttpStatus.NOT_FOUND);
  }
}
