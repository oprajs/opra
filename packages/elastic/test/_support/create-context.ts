import { HttpOperation } from '@opra/common';
import {
  HttpAdapter,
  HttpContext,
  HttpRequest,
  HttpResponse,
  ServerResponseHost,
} from '@opra/http';

export function createContext(
  adapter: HttpAdapter,
  operation?: HttpOperation,
  request?: HttpRequest,
) {
  request = request || HttpRequest.create({ method: 'GET', url: '/' });
  const response = HttpResponse.create(ServerResponseHost.create(request));
  return new HttpContext({
    __adapter: adapter,
    __oprDef: operation,
    __contDef: operation?.owner,
    platform: 'express',
    request,
    response,
  });
}
