import type { ApiDocument } from '@opra/common';
import type { OpraHttpClient } from '../client.js';
import type { HttpResponse } from '../impl/http-response.js';
import type { RequestInterceptor, ResponseInterceptor } from '../types.js';

export interface OpraHttpClientContext {
  serviceUrl: string;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
  createResponse: (init?: HttpResponse.Initiator) => HttpResponse<any>;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  api?: ApiDocument;
  defaults: OpraHttpClient.Defaults;
}
