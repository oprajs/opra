import { translate } from '@opra/i18n';
import { ErrorResponse, OpraException } from '../opra-exception.js';

/**
 * 401 Unauthorized
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends OpraException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = 401;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:UNAUTHORIZED', 'You have not been authenticated to perform this action'),
      severity: 'error',
      code: 'UNAUTHORIZED',
      ...response
    })
  }
}
