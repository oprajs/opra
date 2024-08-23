import { translate } from '../../i18n/index.js';
import type { ErrorIssue } from '../error-issue.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * 406 Not Acceptable
 * This response is sent when the web server, after performing server-driven content negotiation,
 * doesn't find any content that conforms to the criteria given by the user agent.
 */
export class NotAcceptableError extends OpraHttpError {
  status = 406;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:NOT_ACCEPTABLE', 'Not Acceptable'),
      code: 'NOT_ACCEPTABLE',
      ...issue,
    });
  }
}
