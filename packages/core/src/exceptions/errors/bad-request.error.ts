import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums';
import { ApiException, ErrorResponse } from '../api-exception';

export class BadRequestError extends ApiException {
  constructor(response?: ErrorResponse) {
    super({
      message: translate('error:BAD_REQUEST', 'Bad request'),
      severity: 'error',
      code: 'BAD_REQUEST',
      ...response
    }, HttpStatus.BAD_REQUEST);
  }
}
