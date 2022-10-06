import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

export class ResourceConflictError extends OpraException {

  constructor(resource: string, fields: string | string[], cause?: Error) {
    super({
      message: translate(`error:RESOURCE_CONFLICT`, {resource, fields},
          `There is already an other {{resource}} resource with same field values ({{fields}})`),
      severity: 'error',
      code: 'RESOURCE_CONFLICT',
      subject: resource,
      location: fields
    }, cause);
    this.status = 409;
  }

}
