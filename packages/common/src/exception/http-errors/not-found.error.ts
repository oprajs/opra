import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 404 Not Found
 * The server can not find the requested resource. In the browser, this means the URL is not recognized.
 * In an API, this can also mean that the endpoint is valid but the resource itself does not exist.
 * Servers may also send this response instead of 403 Forbidden to hide the existence of a resource
 * from an unauthorized client. This response code is probably the most well known due to its
 * frequent occurrence on the web.
 */
export class NotFoundError extends OpraHttpError {
  status = 404;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:NOT_FOUND', 'Not found'),
      code: 'NOT_FOUND',
      ...issue,
    });
  }
}
