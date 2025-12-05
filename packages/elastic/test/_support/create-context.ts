import { HttpOperation } from '@opra/common';
import {
  HttpAdapter,
  HttpContext,
  HttpIncoming,
  HttpOutgoing,
} from '@opra/http';

export function createContext(
  adapter: HttpAdapter,
  operation?: HttpOperation,
  request?: HttpIncoming,
) {
  request = request || HttpIncoming.from({ method: 'GET', url: '/' });
  const response = HttpOutgoing.from({ req: request });
  return new HttpContext({
    __adapter: adapter,
    __oprDef: operation,
    __contDef: operation?.owner,
    platform: 'express',
    request,
    response,
  });
}
