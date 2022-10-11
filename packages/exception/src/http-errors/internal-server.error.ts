import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 500 Internal Server Error
 * The server has encountered a situation it does not know how to handle.
 */
export class InternalServerError extends OpraException {
  status = 500;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:INTERNAL_SERVER_ERROR', 'Internal server error'),
      severity: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      ...issue
    });
  }

}
