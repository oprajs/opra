import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 403 Forbidden
 * The client does not have access rights to the content; that is, it is unauthorized,
 * so the server is refusing to give the requested resource. Unlike 401 Unauthorized,
 * the client's identity is known to the server.
 */
export class ForbiddenError extends OpraException {
  status = 403;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:FORBIDDEN',
          'You are not authorized to perform this action'),
      code: 'FORBIDDEN',
      ...issue
    });
  }

}
