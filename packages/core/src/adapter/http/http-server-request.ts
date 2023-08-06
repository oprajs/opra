/*
  Some parts of this file contains codes from open source express library
  https://github.com/expressjs
 */

import accepts from 'accepts';
import fresh from 'fresh';
import parseRange, {
  Options as RangeParserOptions,
  Ranges as RangeParserRanges,
  Result as RangeParserResult
} from 'range-parser';
import typeIs from 'type-is';
import { isReadable, mergePrototype, OpraURL } from '@opra/common';
import type { HttpServerResponse } from './http-server-response';
import { HttpIncomingMessage, HttpIncomingMessageHost } from './impl/http-incoming-message.host.js';

function isHttpIncomingMessage(v: any): v is HttpIncomingMessage {
  return v && Array.isArray(v.rawHeaders) && isReadable(v);
}

export namespace HttpServerRequest {
  export function from(instance: HttpIncomingMessage | HttpIncomingMessageHost.Initiator |
      string | Iterable<any> | AsyncIterable<any>
  ): HttpServerRequest {
    if (!isHttpIncomingMessage(instance))
      instance = HttpIncomingMessageHost.from(instance);
    mergePrototype(instance, HttpServerRequestHost.prototype);
    const req = instance as HttpServerRequest;
    req.baseUrl = req.baseUrl || '';
    req.parsedUrl = req.parsedUrl || new OpraURL(req.url);
    return req;
  }
}

export interface HttpServerRequest extends HttpIncomingMessage {

  res: HttpServerResponse;

  baseUrl: string;

  originalUrl: string;

  parsedUrl: OpraURL;

  body?: any;

  /**
   * Return the protocol string "http" or "https"
   * When the "X-Forwarded-Proto" header field will be trusted
   * and used if present.
   */
  protocol: string;

  /**
   * Return the remote address from the trusted proxy.
   *
   * This is the remote address on the socket unless "trust proxy" is set.
   */
  ip: string;

  /**
   * When "trust proxy" is set, trusted proxy addresses + client.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream and "proxy1" and
   * "proxy2" were trusted.
   */
  ips: string[];

  /**
   * Short-hand for:
   *    req.protocol === 'https'
   */
  secure: boolean;

  /**
   * Parse the "Host" header field to a hostname.
   *
   * When the "trust proxy" setting trusts the socket
   * address, the "X-Forwarded-Host" header field will
   * be trusted.
   */
  hostname?: string;

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag still match.
   */
  fresh: boolean;

  /**
   * Check if the request was an _XMLHttpRequest_.
   *
   */
  xhr: boolean;

  /**
   * Secret value for cookie encryption
   *
   */
  secret?: string;

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * @example
   *     req.get('Content-Type');
   *     // => "text/plain"
   *
   *     req.get('content-type');
   *     // => "text/plain"
   *
   *     req.get('Something');
   *     // => undefined
   *
   */
  header(name: 'set-cookie'): string[] | undefined;

  header(name: string): string | undefined;

  get(name: 'set-cookie'): string[] | undefined;

  get(name: string): string | undefined;

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json", a comma-delimited list such as "json, html, text/plain",
   * or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * @example
   *     // Accept: text/html
   *     req.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('html');
   *     // => "html"
   *     req.accepts('text/html');
   *     // => "text/html"
   *     req.accepts('json, text');
   *     // => "json"
   *     req.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('image/png');
   *     req.accepts('png');
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     req.accepts(['html', 'json']);
   *     req.accepts('html, json');
   *     // => "json"
   */
  accepts(): string[];

  accepts(type: string): string | false;

  accepts(type: string[]): string | false;

  accepts(...type: string[]): string | false;

  /**
   * Returns the first accepted charset of the specified character sets,
   * based on the request's Accept-Charset HTTP header field.
   * If none of the specified charsets is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsCharsets(): string[];

  acceptsCharsets(charsets: string[]): string | false;

  acceptsCharsets(...charset: string[]): string | false;

  /**
   * Returns the first accepted encoding of the specified encodings,
   * based on the request's Accept-Encoding HTTP header field.
   * If none of the specified encodings is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsEncodings(): string[];

  acceptsEncodings(encodings: string[]): string | false;

  acceptsEncodings(...encoding: string[]): string | false;

  /**
   * Returns the first accepted language of the specified languages,
   * based on the request's Accept-Language HTTP header field.
   * If none of the specified languages is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsLanguages(): string[];

  acceptsLanguages(lang: string): string | false;

  acceptsLanguages(lang: string[]): string | false;

  acceptsLanguages(...lang: string[]): string | false;

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains the give mime `type`.
   *
   * @example
   *      // With Content-Type: text/html; charset=utf-8
   *      req.is('html');
   *      req.is('text/html');
   *      req.is('text/*');
   *      // => true
   *
   *      // When Content-Type is application/json
   *      req.is('json');
   *      req.is('application/json');
   *      req.is('application/*');
   *      // => true
   *
   *      req.is('html');
   *      // => false
   */
  is(type: string | string[]): string | false | null;

  is(...types: string[]): string | false | null;

  /**
   * Parse Range header field, capping to the given `size`.
   */
  range(size: number, options?: RangeParserOptions): RangeParserRanges | RangeParserResult | undefined;
}


// noinspection JSUnusedLocalSymbols
interface HttpServerRequestHost extends HttpServerRequest {
}

class HttpServerRequestHost {
  basePath: string = '/';
  originalUrl: string;

  get protocol(): string {
    const proto = this.header('X-Forwarded-Proto') || 'http';
    const index = proto.indexOf(',')
    return index !== -1
        ? proto.substring(0, index).trim()
        : proto.trim()
  }

  get secure(): boolean {
    return this.protocol === 'https';
  }

  get hostname(): string | undefined {
    let host = this.get('X-Forwarded-Host');

    if (!host) {
      host = this.get('Host');
    } else if (host.indexOf(',') !== -1) {
      // Note: X-Forwarded-Host is normally only ever a
      //       single value, but this is to be safe.
      host = host.substring(0, host.indexOf(',')).trim()
    }

    if (!host) return;

    // IPv6 literal support
    const offset = host[0] === '['
        ? host.indexOf(']') + 1
        : 0;
    const index = host.indexOf(':', offset);
    return index !== -1
        ? host.substring(0, index)
        : host;
  }

  get fresh(): boolean {
    const method = this.method;
    // GET or HEAD for weak freshness validation only
    if ('GET' !== method && 'HEAD' !== method) return false;
    const status = this.res?.statusCode;
    // 2xx or 304 as per rfc2616 14.26
    if ((status >= 200 && status < 300) || 304 === status) {
      return fresh(this.headers, {
        'etag': this.res.getHeader('ETag'),
        'last-modified': this.res.getHeader('Last-Modified')
      })
    }
    return false;
  }

  get xhr(): boolean {
    const val = this.get('X-Requested-With') || '';
    return val.toLowerCase() === 'xmlhttprequest';
  }

  header(name: string): any {
    name = name.toLowerCase();
    const headers = this.headers;
    switch (name) {
      case 'referer':
        return headers.referer || headers.referrer;
      case 'referrer':
        return headers.referrer || headers.referer;
      default:
        return headers[name];
    }
  }

  get(this: HttpServerRequest, name: string): any {
    return this.header(name);
  }

  accepts(this: HttpServerRequest, ...types): any {
    const accept = accepts(this as any);
    return accept.types.call(accept, ...types);
  }

  acceptsCharsets(this: HttpServerRequest, ...charsets) {
    const accept = accepts(this as any);
    return accept.charsets.call(accept, ...charsets) as any;
  }

  acceptsEncodings(this: HttpServerRequest, ...encoding): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.encodings.apply(accept, encoding);
  }

  acceptsLanguages(this: HttpServerRequest, ...lang): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.languages.apply(accept, lang);
  }

  is(this: HttpServerRequest, type: string | string[], ...otherTypes: string[]): string | false | null {
    const types = Array.isArray(type) ? type : [type];
    if (otherTypes.length)
      types.push(...otherTypes);
    const contentType = this.header('content-type');
    return contentType ? typeIs.is(contentType as any, types) : null;
  }

  range(this: HttpServerRequest, size, options) {
    const range = this.header('range');
    if (!range) return;
    return parseRange(size, range, options);
  }
}

