import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 401 Unauthorized
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends OpraException {
  status = 401;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:UNAUTHORIZED', 'You have not been authenticated to perform this action'),
      code: 'UNAUTHORIZED',
      ...issue
    });
  }

}
