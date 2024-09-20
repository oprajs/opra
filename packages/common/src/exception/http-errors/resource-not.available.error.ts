import { HttpStatusCode } from '../../enums/index.js';
import { translate } from '../../i18n/index.js';
import { OpraHttpError } from '../opra-http-error.js';

/**
 * The server cannot find the requested resource.
 * This can also mean that the endpoint is valid but the resource itself does not exist.
 */
export class ResourceNotAvailableError extends OpraHttpError {
  constructor(resource: string, keyValue?: any, cause?: Error) {
    super(
      {
        message: translate(
          `error:RESOURCE_NOT_AVAILABLE`,
          `Resource "${resource}${keyValue ? '/' + keyValue : ''}" is not available`,
        ),
        severity: 'error',
        code: 'RESOURCE_NOT_AVAILABLE',
        details: {
          resource,
          key: keyValue,
        },
      },
      cause,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
    );
  }
}
