import { translate } from '@opra/i18n';
import { ErrorResponse, OpraException } from '../opra-exception.js';

/**
 * 403 Forbidden
 * The client does not have access rights to the content; that is, it is unauthorized,
 * so the server is refusing to give the requested resource. Unlike 401 Unauthorized,
 * the client's identity is known to the server.
 */
export class ForbiddenError extends OpraException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = 403;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:FORBIDDEN',
          'You are not authorized to perform this action'),
      severity: 'error',
      code: 'FORBIDDEN',
      ...response
    })
  }
}
