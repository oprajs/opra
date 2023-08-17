import { BadRequestError } from './http-errors/bad-request.error.js';
import { FailedDependencyError } from './http-errors/failed-dependency.error.js';
import { ForbiddenError } from './http-errors/forbidden.error.js';
import { MethodNotAllowedError } from './http-errors/method-not-allowed.error.js';
import { NotAcceptableError } from './http-errors/not-acceptable.error.js';
import { NotFoundError } from './http-errors/not-found.error.js';
import { UnauthorizedError } from './http-errors/unauthorized.error.js';
import { UnprocessableEntityError } from './http-errors/unprocessable-entity.error.js';
import { OpraException } from './opra-exception.js';

export function wrapException(error: any): OpraException {
  if (error instanceof OpraException)
    return error;
  let status: number = 500;
  if (typeof error.status === 'number')
    status = error.status;
  else if (typeof error.getStatus === 'function')
    status = error.getStatus();
  switch (status) {
    case 400:
      return new BadRequestError(error);
    case 401:
      return new UnauthorizedError(error);
    case 403:
      return new ForbiddenError(error);
    case 404:
      return new NotFoundError(error);
    case 405:
      return new MethodNotAllowedError(error);
    case 406:
      return new NotAcceptableError(error);
    case 422:
      return new UnprocessableEntityError(error);
    case 424:
      return new FailedDependencyError(error);
    default:
      return new FailedDependencyError(error);
  }
}
