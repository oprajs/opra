// /// <reference lib="dom" />
import type { Observable } from 'rxjs';
import type {OpraSchema} from '@opra/common';
import type { OpraHttpClient } from './client';
import type { HttpRequest } from './http-request.js';
import type { HttpResponse } from './http-response.js';


/* **********************
 * Types
 *********************** */

export type HttpRequestHandler = (observe: HttpObserveType, request: HttpRequest) => Observable<any>;
export type RequestInterceptor = (ctx: HttpClientContext, request: HttpRequest) => void | Promise<void>;
export type ResponseInterceptor = ((ctx: HttpClientContext, observe: HttpObserveType, response: any) => void | Promise<void>);
export type HttpEvent = HttpSentEvent | HttpDownloadProgressEvent | HttpUploadProgressEvent |
    HttpResponseHeaderEvent | HttpResponseEvent | HttpUserEvent;
export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;


/* **********************
 * Enums
 *********************** */

export enum HttpObserveType {
  Response = 'response',
  Body = 'body',
  Events = 'events'
}

/**
 * Type enumeration for the different kinds of `HttpEvent`.
 */
export enum HttpEventType {
  /**
   * The request was sent out over the wire.
   */
  Sent = 'sent',

  /**
   * An upload progress event was received.
   *
   * Note: The `FetchBackend` doesn't support progress report on uploads.
   */
  UploadProgress = 'upload-progress',

  /**
   * The response status code and headers were received.
   */
  ResponseHeader = 'response-header',

  /**
   * A download progress event was received.
   */
  DownloadProgress = 'download-progress',

  /**
   * The full response including the body was received.
   */
  Response = 'response',

  /**
   * A custom event from an interceptor or a backend.
   */
  Custom = 'custom',
}

/* **********************
 * Interfaces
 *********************** */


export interface HttpClientContext {
  client: OpraHttpClient;
  resourceKind: OpraSchema.Resource.Kind;
  resourceName: string;
  operation: string;
  send: HttpRequestHandler;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

export interface HttpRequestDefaults extends Partial<Pick<HttpRequest, 'cache' | 'credentials' |
    'destination' | 'integrity' | 'keepalive' | 'mode' | 'redirect' |
    'referrer' | 'referrerPolicy'>> {
  headers?: HeadersInit;
  params?: URLSearchParamsInit;
}

interface HttpEventBase {
  observe: HttpObserveType;
  request: HttpRequest;
  event: HttpEventType;
}

export interface HttpSentEvent extends HttpEventBase {
  event: HttpEventType.Sent;
}

export interface HttpDownloadProgressEvent extends HttpEventBase {
  event: HttpEventType.DownloadProgress;
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

export interface HttpUploadProgressEvent extends HttpEventBase {
  event: HttpEventType.UploadProgress;
  /**
   * Response object
   */
  response: HttpResponse;
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

export interface HttpResponseHeaderEvent extends HttpEventBase {
  event: HttpEventType.ResponseHeader;
  /**
   * Response object
   */
  response: HttpResponse;
}

export interface HttpResponseEvent extends HttpEventBase {
  event: HttpEventType.Response;
  /**
   * Response object
   */
  response: HttpResponse;
}

export interface HttpUserEvent extends HttpEventBase {
  event: HttpEventType.Custom;

  [key: string | number | symbol]: any;
}
