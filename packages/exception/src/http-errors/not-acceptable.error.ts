import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 406 Not Acceptable
 * This response is sent when the web server, after performing server-driven content negotiation,
 * doesn't find any content that conforms to the criteria given by the user agent.
 */
export class NotAcceptableError extends OpraException {
  status = 406;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:NOT_ACCEPTABLE', 'Not Acceptable'),
      severity: 'error',
      code: 'NOT_ACCEPTABLE',
      ...issue
    });
  }
  
}
