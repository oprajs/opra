import type { HttpResponse } from '../http-response';

export type HttpEvent<T = any, TResponseExt = {}> =
  | HttpSentEvent
  | HttpProgressEvent
  | HttpResponseHeaderEvent
  | HttpResponseEvent<T, TResponseExt>
  | HttpUserEvent;

/**
 * Type enumeration for the different kinds of `HttpEvent`.
 * @enum HttpEventType
 */
export enum HttpEventType {
  /**
   * The request was sent out over the wire.
   */
  Sent = 'Sent',

  /**
   * A download or upload progress event was received.
   */
  UploadProgress = 'UploadProgress',

  /**
   * The response status code and headers were received.
   */
  ResponseHeader = 'ResponseHeader',

  /**
   * A download or upload progress event was received.
   */
  DownloadProgress = 'DownloadProgress',

  /**
   * The full response including the body was received.
   */
  Response = 'Response',

  /**
   * A custom event from an interceptor or a backend.
   */
  User = 'User',
}

/**
 *
 * @interface HttpEventBase
 */
interface HttpEventBase {
  type: HttpEventType;
  request: any;
}

/**
 *
 * @interface HttpSentEvent
 */
export interface HttpSentEvent extends HttpEventBase {
  type: HttpEventType.Sent;
}

/**
 *
 * @interface HttpProgressEvent
 */
interface HttpProgressEvent extends HttpEventBase {
  type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;
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

/**
 *
 * @interface HttpDownloadProgressEvent
 */
export interface HttpDownloadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.DownloadProgress;
}

/**
 *
 * @interface HttpUploadProgressEvent
 */
export interface HttpUploadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.UploadProgress;
}

/**
 *
 * @interface HttpResponseHeaderEvent
 */
export interface HttpResponseHeaderEvent<
  TResponseExt = {},
> extends HttpEventBase {
  type: HttpEventType.ResponseHeader;
  /**
   * Response object
   */
  response: HttpResponse<never> & TResponseExt;
}

/**
 *
 * @interface HttpResponseEvent
 */
export interface HttpResponseEvent<
  T = any,
  TResponseExt = {},
> extends HttpEventBase {
  type: HttpEventType.Response;
  /**
   * Response object
   */
  response: HttpResponse<T> & TResponseExt;
}

/**
 *
 * @interface HttpUserEvent
 */
export interface HttpUserEvent extends HttpEventBase {
  type: HttpEventType.User;

  [key: string | number | symbol]: any;
}
