import { HttpOperation } from '@opra/common';
import { HttpAdapter, HttpContext, HttpIncoming, HttpOutgoing } from '@opra/core';

export function createContext(adapter: HttpAdapter, operation?: HttpOperation, request?: HttpIncoming) {
  request = request || HttpIncoming.from({ method: 'GET', url: '/' });
  const response = HttpOutgoing.from({ req: request });
  return new HttpContext({
    adapter,
    operation,
    controller: operation?.owner,
    platform: 'express',
    request,
    response,
  });
}
