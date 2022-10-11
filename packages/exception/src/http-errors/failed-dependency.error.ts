import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 424 Failed Dependency
 * The request failed due to failure of a previous request.
 */
export class FailedDependencyError extends OpraException {
  status = 424;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:FAILED_DEPENDENCY',
          'The request failed due to failure of a previous request'),
      severity: 'error',
      code: 'FAILED_DEPENDENCY',
      ...issue
    });
  }

}
