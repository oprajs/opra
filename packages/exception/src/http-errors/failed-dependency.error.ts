import { translate } from '@opra/i18n';
import { ErrorResponse, OpraException } from '../opra-exception.js';

/**
 * 424 Failed Dependency
 * The request failed due to failure of a previous request.
 */
export class FailedDependencyError extends OpraException {

  constructor(response?: string | ErrorResponse | Error, cause?: Error) {
    super(response, cause);
    this.status = 424;
  }

  protected _initResponse(response: Partial<ErrorResponse>) {
    super._initResponse({
      message: translate('error:FAILED_DEPENDENCY',
          'The request failed due to failure of a previous request'),
      severity: 'error',
      code: 'FAILED_DEPENDENCY',
      ...response
    })
  }
}
