import { mergePrototype } from '@opra/common';
import type {
  Options as RangeParserOptions,
  Ranges as RangeParserRanges,
  Result as RangeParserResult,
} from 'range-parser';
import { isHttpIncoming, isNodeIncomingMessage } from '../../type-guards.js';
import { HttpIncomingHost } from '../impl/http-incoming.host.js';
import { BodyReader } from '../utils/body-reader.js';
import type { HttpOutgoing } from './http-outgoing.interface.js';
import { NodeIncomingMessage } from './node-incoming-message.interface.js';

/**
 * @interface HttpIncoming
 */
export interface HttpIncoming extends NodeIncomingMessage {
  res: HttpOutgoing;

  baseUrl: string;

  originalUrl: string;

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
   * Used for signed cookies
   */
  secret?: string;

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
   * Path parameter values
   */
  params: Record<string, any>;

  /**
   * Cookie parameter values
   */
  cookies?: Record<string, any>;

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

  /**
   * Receives the body
   * @param options
   */
  readBody(options: BodyReader.Options): Promise<string | Buffer | undefined>;
}

/**
 * @namespace HttpIncoming
 */
export namespace HttpIncoming {
  export function from(
    instance: HttpIncoming | NodeIncomingMessage.Initiator | string | Iterable<any> | AsyncIterable<any>,
  ): HttpIncoming {
    if (isHttpIncoming(instance)) return instance;
    if (!isNodeIncomingMessage(instance)) instance = NodeIncomingMessage.from(instance);
    mergePrototype(instance, HttpIncomingHost.prototype);
    const req = instance as HttpIncoming;
    req.baseUrl = req.baseUrl || '';
    req.params = req.params || {};
    return req;
  }
}
