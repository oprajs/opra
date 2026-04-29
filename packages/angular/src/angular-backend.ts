// @ts-ignore
// @ts-ignore
import * as Angular from '@angular/common/http';
import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import typeIs from '@browsery/type-is';
import {
  HttpBackend,
  type HttpDownloadProgressEvent,
  type HttpEvent,
  HttpEventType,
  HttpResponse,
  type HttpResponseEvent,
  type HttpResponseHeaderEvent,
  type HttpSentEvent,
  type HttpUploadProgressEvent,
} from '@opra/client';
import { isBlob } from '@opra/common';
import { Observable } from 'rxjs';
import { isReadableStreamLike } from 'rxjs/internal/util/isReadableStreamLike';
import type { StrictOmit } from 'ts-gems';

/**
 * Angular specific implementation of {@link HttpBackend} using Angular's HttpClient.
 *
 * @class AngularBackend
 */
export class AngularBackend extends HttpBackend {
  /** Default request options */
  defaults: AngularBackend.RequestDefaults;

  /**
   * Creates a new instance of AngularBackend.
   *
   * @param httpClient The Angular HttpClient instance.
   * @param serviceUrl The base URL of the service.
   * @param options Configuration options.
   */
  constructor(
    readonly httpClient: Angular.HttpClient,
    serviceUrl: string,
    options?: AngularBackend.Options,
  ) {
    super(serviceUrl, options);
    this.defaults = {
      ...options?.defaults,
      headers:
        options?.defaults?.headers instanceof Headers
          ? options?.defaults?.headers
          : new Headers(options?.defaults?.headers),
      params:
        options?.defaults?.params instanceof URLSearchParams
          ? options?.defaults?.params
          : new URLSearchParams(options?.defaults?.params),
    };
  }

  /**
   * Handles the HTTP request using Angular's HttpClient.
   *
   * @param init The request initialization parameters.
   * @returns An observable of {@link HttpEvent}.
   */
  handle(init: AngularBackend.RequestInit): Observable<HttpEvent> {
    const requestInit = this.prepareRequest(init);
    const request = new Angular.HttpRequest(
      requestInit.method,
      requestInit.url.toString(),
      {
        ...requestInit,
        headers: new HttpHeaders(requestInit.headers),
      },
    );

    const _this = this;
    return new Observable<HttpEvent>(subscriber => {
      // Send request
      this.send(request).subscribe({
        next(event) {
          if (event.type === Angular.HttpEventType.Sent) {
            // Emit 'Sent' event
            subscriber.next({
              type: HttpEventType.Sent,
              request,
            } satisfies HttpSentEvent);
            return;
          }

          if (event.type === Angular.HttpEventType.ResponseHeader) {
            // Emit 'ResponseHeader' event
            const headersResponse = _this.createResponse({
              url: request.url,
              headers: requestInit.headers,
              status: event.status,
              statusText: event.statusText,
              hasBody:
                event.headers.has('Content-Type') ||
                event.headers.has('Content-Length'),
            }) as HttpResponse<never>;
            subscriber.next({
              request,
              type: HttpEventType.ResponseHeader,
              response: headersResponse,
            } satisfies HttpResponseHeaderEvent);
            return;
          }

          if (event.type === Angular.HttpEventType.DownloadProgress) {
            // Emit 'DownloadProgress' event
            subscriber.next({
              request,
              type: HttpEventType.DownloadProgress,
              loaded: event.loaded,
              total: event.total,
            } satisfies HttpDownloadProgressEvent);
          }

          if (event.type === Angular.HttpEventType.UploadProgress) {
            // Emit 'UploadProgress' event
            subscriber.next({
              request,
              type: HttpEventType.UploadProgress,
              loaded: event.loaded,
              total: event.total,
            } satisfies HttpUploadProgressEvent);
          }

          if (event.type === Angular.HttpEventType.Response) {
            const headers = new Headers();
            event.headers
              .keys()
              .forEach(k => headers.set(k, event.headers.get(k) || ''));
            const response = _this.createResponse({
              url: request.url,
              headers,
              status: event.status,
              statusText: event.statusText,
              hasBody: !!event.body,
              body: event.body,
            });
            // Emit 'Response' event
            subscriber.next({
              type: HttpEventType.Response,
              request,
              response,
            } satisfies HttpResponseEvent);
          }
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  }

  /**
   * Sends the actual HTTP request.
   *
   * @param request The Angular HttpRequest instance.
   * @protected
   */
  protected send(request: Angular.HttpRequest<any>) {
    return this.httpClient.request(request);
  }

  /**
   * Prepares the request by applying defaults and handling body content.
   *
   * @param init The initial request parameters.
   * @returns The prepared request initialization parameters.
   * @protected
   */
  protected prepareRequest(
    init: AngularBackend.RequestInit,
  ): AngularBackend.RequestInit {
    const headers = init.headers || new Headers();
    const requestInit: AngularBackend.RequestInit = {
      ...init,
      headers,
    };
    this.defaults.headers.forEach((val, key) => {
      if (!headers.has(key)) headers.set(key, val);
    });
    const url = new URL(requestInit.url, this.serviceUrl);
    if (this.defaults.params.size) {
      this.defaults.params.forEach((val, key) => {
        if (!url.searchParams.has(key)) url.searchParams.set(key, val);
      });
      requestInit.url = url.toString();
    }
    if (requestInit.body) {
      let body: any;
      let contentType: string;
      if (
        typeof requestInit.body === 'string' ||
        typeof requestInit.body === 'number' ||
        typeof requestInit.body === 'boolean'
      ) {
        contentType = 'text/plain; charset=UTF-8"';
        body = String(requestInit.body);
        headers.delete('Content-Size');
      } else if (isReadableStreamLike(requestInit.body)) {
        contentType = 'application/octet-stream';
        body = requestInit.body;
      } else if (Buffer.isBuffer(requestInit.body)) {
        contentType = 'application/octet-stream';
        body = requestInit.body;
        headers.set('Content-Size', String(requestInit.body.length));
      } else if (isBlob(requestInit.body)) {
        contentType = requestInit.body.type || 'application/octet-stream';
        body = requestInit.body;
        headers.set('Content-Size', String(requestInit.body.size));
      } else {
        contentType = 'application/json';
        body = JSON.stringify(requestInit.body);
        headers.delete('Content-Size');
      }
      if (!headers.has('Content-Type') && contentType)
        headers.set('Content-Type', contentType);
      requestInit.body = body;
    }
    return requestInit;
  }

  /**
   * Creates a {@link HttpResponse} instance.
   *
   * @param init The response initiator parameters.
   * @returns A new HttpResponse instance.
   * @protected
   */
  protected createResponse(init: HttpResponse.Initiator): HttpResponse {
    return new HttpResponse(init);
  }

  /**
   * Parses the response body based on Content-Type.
   *
   * @param fetchResponse The response to parse.
   * @returns The parsed body.
   * @protected
   */
  protected async parseBody(fetchResponse: Response): Promise<any> {
    let body: any;
    const contentType = fetchResponse.headers.get('Content-Type') || '';
    if (typeIs.is(contentType, ['json', 'application/*+json'])) {
      body = await fetchResponse.json();
      if (typeof body === 'string') body = JSON.parse(body);
    } else if (typeIs.is(contentType, ['text']))
      body = await fetchResponse.text();
    else if (typeIs.is(contentType, ['multipart']))
      body = await fetchResponse.formData();
    else {
      const buf = await fetchResponse.arrayBuffer();
      if (buf.byteLength) body = buf;
    }
    return body;
  }
}

/**
 * Namespace for {@link AngularBackend} related types and interfaces.
 *
 * @namespace AngularBackend
 */
export namespace AngularBackend {
  /** Configuration options for AngularBackend */
  export interface Options extends HttpBackend.Options {
    /** Default request options */
    defaults?: RequestDefaults;
  }

  /** Request initialization parameters for AngularBackend */
  export interface RequestInit extends HttpBackend.RequestInit {
    /** Angular HttpContext */
    context?: HttpContext;
    /** Whether to report progress events */
    reportProgress?: boolean;
    /** Angular HttpParams */
    params?: HttpParams;
    /** The expected response type */
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    /** Whether to send credentials with the request */
    withCredentials?: boolean;
  }

  /** Request options subset for AngularBackend */
  export interface RequestOptions extends Pick<
    RequestInit,
    'context' | 'reportProgress' | 'withCredentials'
  > {}

  /** Default request options for AngularBackend */
  export type RequestDefaults = StrictOmit<RequestOptions, 'context'> & {
    /** Default headers */
    headers: Headers;
    /** Default URL parameters */
    params: URLSearchParams;
  };
}
