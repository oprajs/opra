import { translate } from '../../i18n/index.js';
import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 401 Unauthorized
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends OpraHttpError {
  status = 401;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:UNAUTHORIZED', 'You have not been authenticated to perform this action'),
      code: 'UNAUTHORIZED',
      ...issue,
    });
  }
}
