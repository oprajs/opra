import { HttpStatusCode } from '../../enums/index.js';
import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 403 Forbidden
 * The client does not have access rights to the content; that is, it is unauthorized,
 * so the server is refusing to give the requested resource. Unlike 401 Unauthorized,
 * the client's identity is known to the server.
 */
export class ForbiddenError extends OpraHttpError {
  status = HttpStatusCode.FORBIDDEN;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: 'You are not authorized to perform this action',
      code: 'FORBIDDEN',
      ...issue,
    });
  }
}
