import type { HttpRequest } from '../impl/http-request.js';
import type { URLSearchParamsInit } from '../types.js';

export interface HttpRequestDefaults extends Partial<Pick<HttpRequest, 'cache' | 'credentials' |
    'destination' | 'integrity' | 'keepalive' | 'mode' | 'redirect' |
    'referrer' | 'referrerPolicy'>> {
  headers?: HeadersInit;
  params?: URLSearchParamsInit;
}
