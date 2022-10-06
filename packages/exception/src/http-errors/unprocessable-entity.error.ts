import { translate } from '@opra/i18n';
import { ErrorResponse, OpraException } from '../opra-exception.js';

/**
 * 422 Unprocessable Entity
 * The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends OpraException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = 422;
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
