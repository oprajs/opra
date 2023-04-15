import type { IncomingHttpHeaders } from 'http';
import type stream from 'stream';

export interface HttpRequestMessage extends stream.Readable {
  /**
   * In case of server request, the HTTP version sent by the client. In the case of
   * client response, the HTTP version of the connected-to server.
   * Probably either `'1.1'` or `'1.0'`.
   *
   * Also `message.httpVersionMajor` is the first integer and`message.httpVersionMinor` is the second.
   * @since v0.1.1
   */
  readonly httpVersion: string;
  readonly httpVersionMajor: number;
  readonly httpVersionMinor: number;
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

  body: any;

  method: string;

  // originalUrl: string;

  url: string;

  baseUrl: string;

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

}
