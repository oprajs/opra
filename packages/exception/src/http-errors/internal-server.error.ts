import _ from 'lodash';
import { translate } from '@opra/i18n';
import { ErrorResponse, OpraException } from '../opra-exception.js';

/**
 * 500 Internal Server Error
 * The server has encountered a situation it does not know how to handle.
 */
export class InternalServerError extends OpraException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = 500;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:INTERNAL_SERVER_ERROR', 'Internal server error'),
      severity: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      ..._.omitBy(response, _.isNil)
    })
  }
}
