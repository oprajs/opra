import { ClientHttpHeaders, normalizeHeaders, OpraURLSearchParams } from '@opra/common';
import { RawHttpRequest } from '../http-types.js';

export function mergeRawHttpRequests(target: RawHttpRequest, ...other: (Partial<RawHttpRequest> | undefined)[]): RawHttpRequest {
  let params: URLSearchParams | undefined;
  const arr = [target, ...other];

  let headers: ClientHttpHeaders | undefined;
  for (let i = arr.length - 1; i >= 0; i--) {
    const o = arr[i];
    if (o?.headers) {
      headers = headers || {};
      Object.assign(headers, normalizeHeaders(o.headers));
    }
  }

  for (const o of arr) {
    if (!o)
      continue;
    Object.assign(target, o);
    if (o?.params) {
      params = params || new OpraURLSearchParams();
      o.params.forEach((v, n) => params?.append(n, v));
    }
  }
  target.headers = headers;
  target.params = params;
  return target;
}
