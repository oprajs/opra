import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 400 Bad Request
 * The server cannot or will not process the request due to something that is perceived to be a client error
 * (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
 */
export class BadRequestError extends OpraException {
  status = 400;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:BAD_REQUEST', 'Bad request'),
      code: 'BAD_REQUEST',
      ...issue
    });
  }
}
