import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 400 Bad Request
 * The server cannot or will not process the request due to something that is perceived to be a client error
 * (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
 */
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
