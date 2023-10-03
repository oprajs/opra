import { ApiDocument } from '@opra/common';
import { OpraHttpClient } from '../client.js';
import { HttpResponse } from '../impl/http-response.js';
import { RequestInterceptor, ResponseInterceptor } from '../types.js';

export interface OpraHttpClientContext {
  serviceUrl: string;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
  createResponse: (init?: HttpResponse.Initiator) => HttpResponse<any>;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  api?: ApiDocument;
  defaults: OpraHttpClient.Defaults;
}
