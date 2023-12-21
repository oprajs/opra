import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { ForbiddenError } from '../http-errors/forbidden.error.js';

/**
 * 403 Forbidden
 * The client does not have access rights to the content; that is, it is unauthorized,
 * so the server is refusing to give the requested resource. Unlike 401 Unauthorized,
 * the client's identity is known to the server.
 */
export class PermissionError extends ForbiddenError {

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:PERMISSION_ERROR',
          'You dont have permission for this operation'),
      code: 'PERMISSION_ERROR',
      ...issue
    });
  }

}
