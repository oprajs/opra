import { translate } from '../../i18n/index.js';
import { OpraHttpError } from '../opra-http-error.js';

export class ResourceConflictError extends OpraHttpError {
  status = 409;

  constructor(resource: string, fields: string | string[], cause?: Error) {
    super(
      {
        message: translate(
          `error:RESOURCE_CONFLICT`,
          { resource, fields },
          `There is already an other {{resource}} resource with same values ({{fields}})`,
        ),
        severity: 'error',
        code: 'RESOURCE_CONFLICT',
        details: {
          resource,
          location: fields,
        },
      },
      cause,
    );
  }
}
