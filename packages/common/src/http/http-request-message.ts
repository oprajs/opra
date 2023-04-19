import accepts from 'accepts';
import { IncomingHttpHeaders } from 'http';
import { HeaderInfo, HTTPParser } from 'http-parser-js';
import { Readable } from 'stream';
import typeIs from 'type-is';
import { HttpMessage, HttpMessageHost } from './http-message.host.js';
import { HttpParams } from './http-params.js';

const HTTP_VERSION_PATTERN = /^(\d)\.(\d)$/;

export interface HttpRequestMessage extends HttpMessage {
  /**
   * In case of server request, the HTTP version sent by the client. In the case of
   * client response, the HTTP version of the connected-to server.
   * Probably either `'1.1'` or `'1.0'`.
   *
   * Also `message.httpVersionMajor` is the first integer and`message.httpVersionMinor` is the second.
   * @since v0.1.1
   */
  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;

  /**
   * The request/response headers object.
   *
   * Key-value pairs of header names and values. Header names are lower-cased.
   */
  readonly headers: IncomingHttpHeaders;

  /**
   * The raw request/response headers list exactly as they were received.
   */
  rawHeaders: string[];

  /**
   * The request/response trailers object.
   */
  readonly trailers: NodeJS.Dict<string>;

  /**
   * The raw request/response trailer keys and values exactly as they were received.
   */
  rawTrailers: string[];

  readonly complete: boolean;
  readonly upgrade?: any;

  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the "trust proxy"
   * setting is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   */
  protocol: string;

  /**
   * Short-hand for:
   *
   *    req.protocol == 'https'
   */
  secure: boolean;

  /**
   * Return the remote address, or when
   * "trust proxy" is `true` return
   * the upstream addr.
   */
  ip: string;

  /**
   * When "trust proxy" is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   */
  ips: string[];

  /**
   * Parse the "Host" header field hostname.
   */
  hostname: string;

  method: string;

  // originalUrl: string;

  url: string;

  baseUrl: string;

  query: Record<string, any>;

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     req.get('Content-Type');
   *     // => "text/plain"
   *
   *     req.get('content-type');
   *     // => "text/plain"
   *
   *     req.get('Something');
   *     // => undefined
   *
   * Aliased as `req.header()`.
   */

  get(name: 'set-cookie'): string[] | undefined;

  get(name: string): string | undefined;

  header(name: 'set-cookie'): string[] | undefined;

  header(name: string): string | undefined;

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json", a comma-delimted list such as "json, html, text/plain",
   * or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
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

  acceptsCharsets(charset: string): string | false;

  acceptsCharsets(charset: string[]): string | false;

  acceptsCharsets(...charset: string[]): string | false;

  /**
   * Returns the first accepted encoding of the specified encodings,
   * based on the request's Accept-Encoding HTTP header field.
   * If none of the specified encodings is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsEncodings(): string[];

  acceptsEncodings(encoding: string): string | false;

  acceptsEncodings(encoding: string[]): string | false;

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
   * Examples:
   *
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

}

export namespace HttpRequestMessage {
  export interface Initiator extends HttpMessage.Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    method: string;
    url: string;
    protocol?: string;
    baseUrl?: string;
    ip?: string;
    ips?: [];
  }

  export function create(init: Initiator): HttpRequestMessage {
    return HttpRequestMessageHost.create(init);
  }

  export function fromBuffer(buffer: Buffer | ArrayBuffer): HttpRequestMessage {
    return HttpRequestMessageHost.fromBuffer(buffer);
  }

  export async function fromStream(readable: Readable): Promise<HttpRequestMessage> {
    return HttpRequestMessageHost.fromStream(readable);
  }
}

const kQuery = Symbol('kQuery');
const kQueryProxy = Symbol('kQueryProxy');
const kProtocol = Symbol('kProtocol');

/**
 *
 */
class HttpRequestMessageHost extends HttpMessageHost implements HttpRequestMessage {
  static kQuery = kQuery;
  protected [kQuery]: HttpParams;
  protected [kQueryProxy]: Record<string, any>;
  protected [kProtocol]?: string;
  httpVersionMajor: number = 1;
  httpVersionMinor: number = 0;
  method: string;
  url: string;
  baseUrl: string;
  ip: string;
  ips: string[];

  constructor() {
    super();
    this[kQuery] = new HttpParams();
    this[kQueryProxy] = this[kQuery].getProxy();
  }

  get httpVersion(): string {
    return this.httpVersionMajor + '.' + this.httpVersionMinor;
  }

  set httpVersion(value: string) {
    const m = HTTP_VERSION_PATTERN.exec(value);
    if (!m)
      throw new TypeError(`Invalid http version string (${value})`);
    this.httpVersionMajor = parseInt(m[1], 10);
    this.httpVersionMinor = parseInt(m[2], 10);
  }

  get hostname(): string {
    let host = this.get('X-Forwarded-Host') || this.get('Host');
    if (host && host.indexOf(',') !== -1) {
      // Note: X-Forwarded-Host is normally only ever a single value, but this is to be safe.
      host = host.substring(0, host.indexOf(',')).trimEnd();
    }
    if (!host) return '';
    // IPv6 literal support
    const offset = host[0] === '['
        ? host.indexOf(']') + 1
        : 0;
    const index = host.indexOf(':', offset);

    return index !== -1
        ? host.substring(0, index)
        : host;
  }

  get protocol(): string {
    if (this[kProtocol])
      return this[kProtocol];
    // Note: X-Forwarded-Proto is normally only ever a
    //       single value, but this is to be safe.
    const header = this.get('X-Forwarded-Proto');
    if (header) {
      const index = header.indexOf(',');
      return index !== -1
          ? header.substring(0, index).trim()
          : header.trim()
    }
    return 'http';
  }

  set protocol(v: string | undefined) {
    this[kProtocol] = v;
  }

  get secure(): boolean {
    return this.protocol === 'https';
  }

  get query(): Record<string, any> {
    return this[kQueryProxy];
  }

  set query(value: Record<string, any>) {
    this[kQuery].clear();
    this[kQuery].appendAll(value);
  }

  header(name: 'set-cookie' | 'Set-Cookie'): string[] | undefined
  header(name: string): string | undefined
  header(name: string): any {
    return this.getHeader(name);
  }

  accepts(): string[];
  accepts(type: string): string | false;
  accepts(type: string[]): string | false;
  accepts(...type: string[]): string | false;
  accepts(...type): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.types.apply(accept, type);
  }

  acceptsCharsets(): string[];
  acceptsCharsets(charset: string): string | false;
  acceptsCharsets(charset: string[]): string | false;
  acceptsCharsets(...charset: string[]): string | false;
  acceptsCharsets(...charset): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.charsets.apply(accept, charset);
  }

  acceptsEncodings(): string[];
  acceptsEncodings(encoding: string): string | false;
  acceptsEncodings(encoding: string[]): string | false;
  acceptsEncodings(...encoding: string[]): string | false;
  acceptsEncodings(...encoding): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.encodings.apply(accept, encoding);
  }


  acceptsLanguages(): string[];
  acceptsLanguages(lang: string): string | false;
  acceptsLanguages(lang: string[]): string | false;
  acceptsLanguages(...lang: string[]): string | false;
  acceptsLanguages(...lang): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.languages.apply(accept, lang);
  }

  is(type: string | string[], ...otherTypes: string[]): string | false | null {
    const types = Array.isArray(type) ? type : [type];
    if (otherTypes.length)
      types.push(...otherTypes);
    const contentType = this.getHeader('content-type');
    return contentType ? typeIs.is(contentType as any, types) : null;
  }

  protected _init(init: HttpRequestMessage.Initiator) {
    super._init(init);
    this.method = init.method.toUpperCase();
    this.url = init.url;
    this.baseUrl = init.baseUrl || this.url;
    this.protocol = init.protocol;
  }

  protected [HttpMessageHost.kOnHeaderReceived](info: HeaderInfo) {
    super[HttpMessageHost.kOnHeaderReceived](info);
    this.method = HTTPParser.methods[info.method];
    this.url = info.url;
    this.baseUrl = info.url;
  }

  static create(init: HttpRequestMessage.Initiator): HttpRequestMessage {
    const msg = new HttpRequestMessageHost();
    msg._init(init);
    return msg;
  }

  static fromBuffer(buffer: Buffer | ArrayBuffer): HttpRequestMessage {
    const msg = new HttpRequestMessageHost();
    msg._parseBuffer(buffer, HTTPParser.REQUEST);
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async fromStream(readable: Readable): Promise<HttpRequestMessage> {
    throw new Error('fromStream is not implemented yet')
  }

}
