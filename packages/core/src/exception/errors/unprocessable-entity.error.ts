import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 422 Unprocessable Entity
 * The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends ApiException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = HttpStatus.UNPROCESSABLE_ENTITY;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:UNPROCESSABLE_ENTITY', 'Unprocessable entity'),
      severity: 'error',
      code: 'UNPROCESSABLE_ENTITY',
      ...response
    })
  }
}
