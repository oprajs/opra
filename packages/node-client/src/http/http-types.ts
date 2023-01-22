// /// <reference lib="dom" />
import { Observable } from 'rxjs';
import { HttpHeadersInit, HttpParamsInit, HttpRequest, HttpResponse } from '@opra/common';

export type ObserveType = 'response' | 'body' | 'events';
export type HttpEventType = 'request' | 'upload-progress' | 'headers-received' |
    'download-progress' | 'response';

export type HttpRequestHandler = (observe: ObserveType, req: HttpRequest) => Observable<any>;

export type HttpRequestDefaults = Partial<Pick<HttpRequest, 'cache' | 'credentials' |
    'destination' | 'integrity' | 'keepalive' | 'mode' | 'redirect' |
    'referrer' | 'referrerPolicy'>> & {
  headers?: HttpHeadersInit;
  params?: HttpParamsInit;
};

export type CommonHttpRequestOptions = {
  observe?: ObserveType;
  http?: HttpRequestDefaults;
}

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
