import contentDisposition from 'content-disposition';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import encodeUrl from 'encodeurl';
import { HeaderInfo, HTTPParser, ParserType } from 'http-parser-js';
import mime from 'mime-types';
import path from 'path';
import statuses from 'statuses';
import stream from 'stream';
import { HttpMessageHost } from './http-message.host.js';
import { HttpRequestMessage } from './interfaces/http-request-message.interface.js';
import { HttpResponseMessage } from './interfaces/http-response-message.interface.js';

/**
 * @namespace HttpResponseMessageHost
 */
export namespace HttpResponseMessageHost {
  export interface Initiator extends HttpMessageHost.Initiator {
    statusCode?: number;
    statusMessage?: string;
    req?: HttpRequestMessage;
    chunkedEncoding?: boolean;
  }

  export interface CookieOptions extends cookie.CookieSerializeOptions {
    signed?: boolean;
  }
}

export interface HttpResponseMessageHost extends stream.Writable {

}

/**
 * @class HttpResponseMessageHost
 */
export class HttpResponseMessageHost extends HttpMessageHost implements HttpResponseMessage {
  chunkedEncoding?: boolean;
  req?: HttpRequestMessage;
  statusCode?: number;
  statusMessage?: string;

  constructor(init: HttpResponseMessageHost.Initiator | Buffer | ArrayBuffer) {
    super(init, HTTPParser.RESPONSE);
  }

  header(name: 'set-cookie' | 'Set-Cookie', value: string | string[]): this
  header(name: string, value: number | string): this
  header(headers: Record<string, number | string | string[]>): this;
  header(arg0, arg1?): this {
    return this.set(arg0, arg1);
  }

  append(name: string, value: string | number | string[]): this {
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
  cookie(name: string, value: string, options?: HttpResponseMessageHost.CookieOptions) {
    const opts: HttpResponseMessageHost.CookieOptions = {...options};
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
  clearCookie(name: string, options?: HttpResponseMessageHost.CookieOptions) {
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
    this.end();
  }

  send(body: any): this {
    this._body = body;
    return this;
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
    const body = statuses.message[statusCode] || String(statusCode);
    this.statusCode = statusCode;
    this.type('txt');
    return this.send(body);
  }

  protected _init(init: HttpMessageHost.Initiator | Buffer | ArrayBuffer, parserType: ParserType) {
    stream.Writable.apply(this);
    super._init(init, parserType);
  }

  protected _assign(init: HttpResponseMessageHost.Initiator) {
    super._assign(init);
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

}

Object.assign(HttpResponseMessageHost.prototype, stream.Writable.prototype);
