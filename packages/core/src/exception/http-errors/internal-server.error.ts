import _ from 'lodash';
import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 500 Internal Server Error
 * The server has encountered a situation it does not know how to handle.
 */
export class InternalServerError extends ApiException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:INTERNAL_SERVER_ERROR'),
      severity: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      ..._.omitBy(response, _.isNil)
    })
  }
}
