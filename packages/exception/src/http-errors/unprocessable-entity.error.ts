import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

/**
 * 422 Unprocessable Entity
 * The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends OpraException {
  status = 422;

  setIssue(issue) {
    super.setIssue({
      message: translate('error:UNPROCESSABLE_ENTITY', 'Unprocessable entity'),
      severity: 'error',
      code: 'UNPROCESSABLE_ENTITY',
      ...issue
    });
  }

}
