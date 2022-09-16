import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException, ErrorResponse } from '../api-exception.js';

/**
 * 424 Failed Dependency
 * The request failed due to failure of a previous request.
 */
export class FailedDependencyError extends ApiException {
  constructor(response?: ErrorResponse, cause?: Error) {
    super({
      message: translate('error:FAILED_DEPENDENCY', 'The request failed due to failure of a previous request.'),
      severity: 'error',
      code: 'FAILED_DEPENDENCY',
      ...response
    }, cause);
    this.status = HttpStatus.FAILED_DEPENDENCY;
  }
}
