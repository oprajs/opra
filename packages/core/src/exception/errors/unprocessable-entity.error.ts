import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums';
import { ApiException, ErrorResponse } from '../api-exception';

/**
 * 422 Unprocessable Entity
 * The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends ApiException {
  constructor(response?: ErrorResponse) {
    super({
      message: translate('error:UNPROCESSABLE_ENTITY', 'Unprocessable entity'),
      severity: 'error',
      code: 'UNPROCESSABLE_ENTITY',
      ...response
    }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
