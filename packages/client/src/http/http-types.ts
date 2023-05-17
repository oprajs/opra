// /// <reference lib="dom" />
import type { Observable } from 'rxjs';
import type { HttpHeaders, HttpParams } from '@opra/common';
import type { OpraHttpClient } from './http-client.js';
import type { HttpRequest } from './http-request.js';
import type { HttpResponse } from './http-response.js';

export type ObserveType = 'response' | 'body' | 'events';
export type HttpEventType = 'request' | 'upload-progress' | 'headers-received' |
    'download-progress' | 'response';

export type HttpRequestHandler = (observe: ObserveType, request: HttpRequest) => Observable<any>;
export type RequestInterceptor = (ctx: HttpClientContext, request: HttpRequest) => void | Promise<void>;
export type ResponseInterceptor = ((ctx: HttpClientContext, observe: ObserveType, response: any) => void | Promise<void>);

export interface HttpClientContext {
  readonly client: OpraHttpClient;
  readonly resourceName: string;
  send: HttpRequestHandler;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

export type HttpRequestDefaults = Partial<Pick<HttpRequest, 'cache' | 'credentials' |
    'destination' | 'integrity' | 'keepalive' | 'mode' | 'redirect' |
    'referrer' | 'referrerPolicy'>> & {
  headers?: HttpHeaders.Initiator;
  params?: HttpParams.Initiator;
};

export interface HttpEvent {
  event: HttpEventType | string;
  request: HttpRequest;
}

export interface HttpHeadersReceivedEvent extends HttpEvent {
  event: 'headers-received';
  response: HttpResponse;
}

export interface HttpResponseEvent extends HttpEvent {
  event: 'response';
  response: HttpResponse;
}

export interface HttpUploadProgressEvent extends HttpEvent {
  event: 'upload-progress';
  /**
   * Number of bytes uploaded
   */
  loaded: number;
  /**
   * Total number of bytes to upload.
   * Depending on the request, this may not be computable and thus may not be present.
   */
  total?: number;
}

export interface HttpDownloadProgressEvent extends HttpEvent {
  event: 'download-progress';
  /**
   * Number of bytes download
   */
  loaded: number;
  /**
   * Total number of bytes to download.
   * Depending on the response, this may not be computable and thus may not be present.
   */
  total?: number;
}
