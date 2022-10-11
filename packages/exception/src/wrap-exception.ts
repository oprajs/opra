import {
  BadRequestError,
  FailedDependencyError,
  ForbiddenError,
  MethodNotAllowedError,
  NotAcceptableError, NotFoundError,
  OpraException, UnauthorizedError, UnprocessableEntityError
} from './index.js';

export function wrapException(e: any): OpraException {
  if (e instanceof OpraException)
    return e;
  let status: number = 500;
  if (typeof e.status === 'number')
    status = e.status;
  else if (typeof e.getStatus === 'function')
    status = e.getStatus();
  switch (status) {
    case 400:
      return new BadRequestError(e);
    case 401:
      return new UnauthorizedError(e);
    case 403:
      return new ForbiddenError(e);
    case 404:
      return new NotFoundError(e);
    case 405:
      return new MethodNotAllowedError(e);
    case 406:
      return new NotAcceptableError(e);
    case 422:
      return new UnprocessableEntityError(e);
    case 424:
      return new FailedDependencyError(e);
    default:
      return new FailedDependencyError(e);
  }
}
