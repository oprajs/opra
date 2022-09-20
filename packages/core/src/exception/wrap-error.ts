import { ApiException, ErrorResponse } from './api-exception.js';
import { InternalServerError } from './http-errors/internal-server.error.js';

export function wrapError(response: string | ErrorResponse | Error): ApiException {
  if (response instanceof ApiException)
    return response;

  if (response instanceof Error) {
    const x = response as any;
    if (typeof x.status === 'number' || typeof x.getStatus === 'function')
      return new ApiException(response);
    return new InternalServerError(response);
  }
  return new InternalServerError();
}
