import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException } from '../api-exception.js';

export class ResourceConflictError extends ApiException {

  constructor(resource: string, fields: string | string[], cause?: Error) {
    super({
      message: translate(`error:RESOURCE_CONFLICT`, {resource, fields}),
      severity: 'error',
      code: 'RESOURCE_CONFLICT',
      subject: resource,
      location: fields
    }, cause);
    this.status = HttpStatus.CONFLICT;
  }

}
