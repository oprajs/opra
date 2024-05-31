import {
  BadRequestError,
  FailedDependencyError,
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotAcceptableError,
  NotFoundError,
  OpraHttpError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '@opra/common';

export function wrapException(error: any): OpraHttpError {
  if (error instanceof OpraHttpError) return error;
  let status: number = 500;
  if (typeof error.status === 'number') status = error.status;
  else if (typeof error.getStatus === 'function') status = error.getStatus();
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
      return new InternalServerError(error);
  }
}
