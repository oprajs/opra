import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 404 Not Found
 * The server can not find the requested resource. In the browser, this means the URL is not recognized.
 * In an API, this can also mean that the endpoint is valid but the resource itself does not exist.
 * Servers may also send this response instead of 403 Forbidden to hide the existence of a resource
 * from an unauthorized client. This response code is probably the most well known due to its
 * frequent occurrence on the web.
 */
export class NotFoundError extends ApiException {
  constructor(response?: ErrorResponse, cause?: Error) {
    super({
      message: translate('error:NOT_FOUND', 'Not found'),
      severity: 'error',
      code: 'NOT_FOUND',
      ...response
    }, cause);
    this.status = HttpStatus.NOT_FOUND;
  }
}
