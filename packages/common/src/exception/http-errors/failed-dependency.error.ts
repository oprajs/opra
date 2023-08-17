import { translate } from '../../i18n/index.js';
import { ErrorIssue } from '../error-issue.js';
import { OpraException } from '../opra-exception.js';

/**
 * 424 Failed Dependency
 * The request failed due to failure of a previous request.
 */
export class FailedDependencyError extends OpraException {
  status = 424;

  protected init(issue: Partial<ErrorIssue>) {
    super.init({
      message: translate('error:FAILED_DEPENDENCY',
          'The request failed due to failure of a previous request'),
      code: 'FAILED_DEPENDENCY',
      ...issue
    });
  }

}
