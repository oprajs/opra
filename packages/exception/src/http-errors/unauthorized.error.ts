import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 401 Unauthorized
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends OpraException {
  status = 401;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:UNAUTHORIZED', 'You have not been authenticated to perform this action'),
      severity: 'error',
      code: 'UNAUTHORIZED',
      ...issue
    });
  }

}
