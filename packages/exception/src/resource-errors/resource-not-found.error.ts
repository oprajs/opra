import { translate } from '@opra/i18n';
import { OpraException } from '../opra-exception.js';

export class ResourceNotFoundError extends OpraException {

  constructor(resource: string, keyValue: any, cause?: Error) {
    super({
      message: translate(`error:RESOURCE_NOT_FOUND`, {resource: resource + '@' + keyValue},
          `The resource '{{resource}}' could not be found`),
      severity: 'error',
      code: 'RESOURCE_NOT_FOUND',
      subject: resource,
      key: keyValue
    }, cause);
    this.status = 404;
  }

}
