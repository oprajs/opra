import { translate } from '@opra/i18n';
import { HttpStatus } from '../../enums/index.js';
import { ApiException } from '../api-exception.js';

export class ResourceNotFoundError extends ApiException {

  constructor(resource: string, keyValue: any, cause?: Error) {
    super({
      message: translate(`error:RESOURCE_NOT_FOUND`, {resource: resource + '@' + keyValue}),
      severity: 'error',
      code: 'RESOURCE_NOT_FOUND',
      subject: resource,
      key: keyValue
    }, cause);
    this.status = HttpStatus.NOT_FOUND;
  }

}
