import contentDisposition from 'content-disposition';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import encodeUrl from 'encodeurl';
import mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';
import { HeaderInfo, HTTPParser } from '@browsery/http-parser';
import { HttpStatusMessages } from '@opra/common';
import { HttpMessage, HttpMessageHost } from './http-message.host.js';
import type { HttpRequestMessage } from './http-request-message.js';

export interface CookieOptions extends cookie.CookieSerializeOptions {
  signed?: boolean;
}

export interface HttpResponseMessage extends HttpMessage {

  method?: string | undefined;
  url?: string | undefined;
  body?: any;
  statusCode?: number;
  statusMessage?: string;
  readonly upgrade?: any;

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

  get(field: string): string | undefined;

  // readonly headers: OutgoingHttpHeaders;

  getHeader(name: string): number | string | string[] | undefined;


  /**
   * Set header `field` to `val`,
   * or pass an object of header fields.
   *
   * Examples:
   *
   *    msg.setHeader('Foo', ['bar', 'baz']);
   *    msg.setHeader('Accept', 'application/json');
   *    msg.setHeader({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   */

  setHeader(name: string, value: number | string | readonly string[]): this;

  /**
   * Set status `code`.
   */
  status(code: number): this;

  /**
   * Set the response HTTP status code to `statusCode` and send its string representation as the response body.
   * @link http://expressjs.com/4x/api.html#res.sendStatus
   *
   * Examples:
   *
   *    res.sendStatus(200); // equivalent to res.status(200).send('OK')
   *    res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
   *    res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
   *    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
   */
  sendStatus(code: number): this;


  /**
   * Set Link header field with the given `links`.
   *
   * Examples:
   *
   *    res.links({
   *      next: 'http://api.example.com/users?page=2',
   *      last: 'http://api.example.com/users?page=5'
   *    });
   */
  links(links: any): this;


  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   *     res.status(500).json('oh noes!');
   *     res.status(404).json('I dont have that');
   */
  json(body: any): this;

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  contentType(type: string): this;

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  type(type: string): this;

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
   */
  attachment(filename?: string): this;

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']);
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * Aliased as `res.header()`.
   */
  set(field: any): this;

  set(field: string, value?: string | string[]): this;

  header(field: any): this;

  header(field: string, value?: string | string[]): this;

  append(field: string, value?: string | string[]): this;

  /** Clear cookie `name`. */
  clearCookie(name: string, options?: CookieOptions): this;

  /**
   * Set cookie `name` to `val`, with the given `options`.
   *
   * Options:
   *
   *    - `maxAge`   max-age in milliseconds, converted to `expires`
   *    - `signed`   sign the cookie
   *    - `path`     defaults to "/"
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
   *
   *    // save as above
   *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
   */
  cookie(name: string, val: string, options: CookieOptions): this;

  cookie(name: string, val: any, options: CookieOptions): this;

  cookie(name: string, val: any): this;

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be the name of a mapped url, for
   * example by default express supports "back" which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * Examples:
   *
   *    res.location('/foo/bar').;
   *    res.location('http://example.com');
   *    res.location('../login'); // /blog/post/1 -> /blog/login
   *
   * Mounting:
   *
   *   When an application is mounted and `res.location()`
   *   is given a path that does _not_ lead with "/" it becomes
   *   relative to the mount-point. For example if the application
   *   is mounted at "/blog", the following would become "/blog/login".
   *
   *      res.location('login');
   *
   *   While the leading slash would result in a location of "/login":
   *
   *      res.location('/login');
   */
  location(url: string): this;

  /**
   * Redirect to the given `url` with optional response `status`
   * defaulting to 302.
   *
   * The resulting `url` is determined by `res.location()`, so
   * it will play nicely with mounted apps, relative paths,
   * `"back"` etc.
   *
   * Examples:
   *
   *    res.redirect('back');
   *    res.redirect('/foo/bar');
   *    res.redirect('http://example.com');
   *    res.redirect(301, 'http://example.com');
   *    res.redirect('http://example.com', 301);
   *    res.redirect('../login'); // /blog/post/1 -> /blog/login
   */
  redirect(url: string): void;

  redirect(status: number, url: string): void;

  /** @deprecated use res.redirect(status, url) instead */
  redirect(url: string, status: number): void;

}


/**
 * @namespace HttpResponseMessage
 */
export namespace HttpResponseMessage {
  export interface Initiator extends HttpMessage.Initiator {
    statusCode?: number;
    statusMessage?: string;
    req?: HttpRequestMessage;
    chunkedEncoding?: boolean;
  }

  export function create(init: Initiator): HttpResponseMessage {
    return HttpResponseMessageHost.create(init);
  }

  export function fromBuffer(buffer: Buffer | ArrayBuffer): HttpResponseMessage {
    return HttpResponseMessageHost.fromBuffer(buffer);
  }

  export async function fromStream(readable: Readable): Promise<HttpResponseMessage> {
    return HttpResponseMessageHost.fromStream(readable);
  }

}

/**
 * @class HttpResponseMessageHost
 */
export class HttpResponseMessageHost extends HttpMessageHost implements HttpResponseMessage {
  chunkedEncoding?: boolean;
  req?: HttpRequestMessage;
  statusCode?: number;
  statusMessage?: string;

  constructor() {
    super();
  }

  header(name: 'set-cookie' | 'Set-Cookie', value: string | string[]): this
  header(name: string, value: number | string): this
  header(headers: Record<string, number | string | string[]>): this;
  header(arg0, arg1?): this {
    return this.set(arg0, arg1);
  }

  append(name: string, value: string | string[]): this {
    this[HttpMessageHost.kHeaders].append(name, value);
    return this;
  }

  /**
   * Set "Content-Disposition" header to "attachment" with optional `filename`.
   */
  attachment(filename?: string): this {
    if (filename)
      this.type(path.extname(filename));
    this.set('Content-Disposition', contentDisposition(filename));
    return this;
  }

  /**
   * Alias for msg.type()
   */
  contentType(type: string): this {
    return this.type(type);
  }


  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  type(type: string): this {
    const ct = type.indexOf('/') === -1
        ? mime.lookup(type)
        : type;
    if (ct)
      this.set('Content-Type', ct);
    return this;
  }

  /**
   * Set cookie `name` to `value`, with the given `options`.
   *
   * Options:
   *
   *    - `maxAge`   max-age in milliseconds, converted to `expires`
   *    - `signed`   sign the cookie
   *    - `path`     defaults to "/"
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
   *
   *    // same as above
   *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
   *
   */
  cookie(name: string, value: string, options?: CookieOptions) {
    const opts: CookieOptions = {...options};
    const secret = (this.req as any)?.secret;
    const signed = opts.signed;

    if (signed && !secret) {
      throw new Error('cookieParser("secret") required for signed cookies');
    }

    let val = typeof value === 'object'
        ? 'j:' + JSON.stringify(value)
        : String(value);

    if (signed)
      val = 's:' + cookieSignature.sign(val, secret);

    if (opts.maxAge != null) {
      const maxAge = opts.maxAge - 0;
      if (!isNaN(maxAge)) {
        opts.expires = new Date(Date.now() + maxAge)
        opts.maxAge = Math.floor(maxAge / 1000)
      }
    }

    if (opts.path == null)
      opts.path = '/';

    // Remove old cookie
    let a = this.get('Set-Cookie');
    if (a && Array.isArray(a)) {
      a = a.filter(x => !x.startsWith(name + '='));
      this.set('Set-Cookie', a);
    }

    this.append('Set-Cookie', cookie.serialize(name, String(val), opts));

    return this;
  }

  /**
   * Clear cookie `name`.
   */
  clearCookie(name: string, options?: CookieOptions) {
    return this.cookie(name, '', {expires: new Date(1), path: '/', ...options});
  }

  /**
   * Set Link header field with the given `links`.
   *
   * Examples:
   *
   *    res.links({
   *      next: 'http://api.example.com/users?page=2',
   *      last: 'http://api.example.com/users?page=5'
   *    });
   *
   */

  links(links: Record<string, string>) {
    let link = this.get('Link') || '';
    if (link) link += ', ';
    return this.set('Link', link + Object.keys(links).map(rel =>
        '<' + links[rel] + '>; rel="' + rel + '"'
    ).join(', '));
  }

  redirect(url: string)
  redirect(status: number, url: string)
  redirect(arg0: number | string, url?: string) {
    let status = 302;
    // allow status / url
    if (typeof arg0 === 'number') {
      status = arg0;
    } else url = arg0 || '';

    // Set location header
    this.location(url || '/');
    // Respond
    this.statusCode = status;
  }


  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   */
  json(obj: any): this {
    if (!this.get('Content-Type'))
      this.set('Content-Type', 'application/json');
    const body = JSON.stringify(obj);
    return this.send(body);
  }

  location(url: string) {
    let loc = url;
    // "back" is an alias for the referrer
    if (url === 'back')
      loc = this.req?.get('Referrer') || '/';
    // set location
    return this.set('Location', encodeUrl(loc));
  }

  /**
   * Set status `code`.
   */
  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  /**
   * Set the response HTTP status code to `statusCode` and send its string representation as the response body.
   * @link http://expressjs.com/4x/api.html#res.sendStatus
   *
   * Examples:
   *
   *    res.sendStatus(200); // equivalent to res.status(200).send('OK')
   *    res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
   *    res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
   *    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
   */
  sendStatus(statusCode: number): this {
    const body = HttpStatusMessages[statusCode] || String(statusCode);
    this.statusCode = statusCode;
    this.type('txt');
    return this.send(body);
  }

  protected _init(init: HttpResponseMessage.Initiator) {
    super._init(init);
    this.statusCode = init?.statusCode;
    this.statusMessage = init?.statusMessage;
    this.req = init?.req;
    this.chunkedEncoding = init?.chunkedEncoding;
  }

  protected [HttpMessageHost.kOnHeaderReceived](info: HeaderInfo) {
    super[HttpMessageHost.kOnHeaderReceived](info);
    this.statusCode = info.statusCode
    this.statusMessage = info.statusMessage;
  }


  static create(init: HttpResponseMessage.Initiator): HttpResponseMessage {
    const msg = new HttpResponseMessageHost();
    msg._init(init);
    return msg;
  }

  static fromBuffer(buffer: Buffer | ArrayBuffer): HttpResponseMessage {
    const msg = new HttpResponseMessageHost();
    msg._parseBuffer(buffer, HTTPParser.RESPONSE);
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async fromStream(readable: Readable): Promise<HttpResponseMessage> {
    throw new Error('fromStream is not implemented yet')
  }

}
