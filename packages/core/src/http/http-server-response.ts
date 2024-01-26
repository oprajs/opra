/*
  Some parts of this file contains codes from open source express library
  https://github.com/expressjs
 */

import contentDisposition from 'content-disposition';
import contentType from 'content-type';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import { CipherKey } from 'crypto';
import encodeUrl from 'encodeurl';
import mime from 'mime-types';
import path from 'path';
import { toString } from 'putil-varhelpers';
import vary from 'vary';
import { HttpStatusCode, isStream, mergePrototype } from '@opra/common';
import type { HttpServerRequest } from './http-server-request.js';
import { HttpOutgoingMessage, HttpOutgoingMessageHost } from './impl/http-outgoing-message.host.js';

const charsetRegExp = /;\s*charset\s*=/;

function isHttpIncomingMessage(v: any): v is HttpOutgoingMessage {
  return v && typeof v.getHeaders === 'function' && isStream(v);
}

export namespace HttpServerResponse {
  export function from(
      instance?: HttpOutgoingMessage | HttpOutgoingMessageHost.Initiator
  ): HttpServerResponse {
    if (!isHttpIncomingMessage(instance))
      instance = new HttpOutgoingMessageHost(instance);
    mergePrototype(instance, HttpServerResponseHost.prototype);
    return instance as HttpServerResponse;
  }
}

export interface HttpServerResponse extends HttpOutgoingMessage {

  req?: HttpServerRequest;

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
   */
  attachment(this: HttpServerResponse, filename?: string): this;


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
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * @example
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  contentType(type: string): this;

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
  links(links: Record<string, string>): this;

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

  /**
   * Set status `code`.
   */
  status(code: number): this;

  /**
   * Send given HTTP status code.
   *
   * Sets the response status to `statusCode` and the body of the
   * response to the standard description from node's http.STATUS_CODES
   * or the statusCode number if no description.
   */
  sendStatus(statusCode: number);

  /**
   * Send a response.
   *
   * @example
   *     res.send(new Buffer('wahoo'));
   *     res.send({ some: 'json' });
   *     res.send('<p>some html</p>');
   *     res.status(404).send('Sorry, cant find that');
   */
  send(body?: any): this;
}

export interface CookieOptions {
  secret?: string;
  maxAge?: number;
  signed?: boolean;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  encode?: ((val: string) => string);
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}


interface HttpServerResponseHost extends HttpServerResponse {

}

class HttpServerResponseHost {

  attachment(filename?: string) {
    if (filename)
      this.contentType(path.extname(filename));
    this.setHeader('Content-Disposition', contentDisposition(filename));
    return this;
  }

  contentType(type) {
    const ct = type.indexOf('/') === -1
        ? mime.lookup(type)
        : type;
    this.setHeader('Content-Type', ct);
    return this;
  }

  setHeader(field: string | Record<string, any>, val?: any) {
    const setHeader: Function = Object.getPrototypeOf(this).setHeader;
    if (typeof field === 'object') {
      for (const [k, v] of Object.entries(field)) {
        this.setHeader(k, v);
      }
      return this;
    }
    const fieldLower = field.toLowerCase();
    let value = Array.isArray(val)
        ? val.map(String)
        : (val ? String(val) : '');

    // add charset to content-type
    if (fieldLower === 'content-type') {
      if (Array.isArray(value)) {
        throw new TypeError('Content-Type cannot be set to an Array');
      }
      if (!charsetRegExp.test(value)) {
        const charset = mime.charsets.lookup(value.split(';')[0]);
        if (charset) value += '; charset=' + charset.toLowerCase();
      }
    }
    setHeader.call(this, field, value);
    return this;
  }

  clearCookie(name: string, options: CookieOptions) {
    const opts = {
      expires: new Date(1),
      path: '/',
      ...options
    };
    return this.cookie(name, '', opts);
  }

  cookie(name: string, value: any, options?: CookieOptions) {
    const opts = {...options};
    let val = typeof value === 'object'
        ? 'j:' + JSON.stringify(value)
        : String(value);

    if (opts.signed) {
      const secret: CipherKey | undefined = opts.secret || this.req?.secret;
      if (!secret)
        throw new Error('"secret" required for signed cookies');
      val = 's:' + cookieSignature.sign(val, secret);
    }

    if (opts.maxAge != null) {
      const maxAge = opts.maxAge - 0;
      if (!isNaN(maxAge)) {
        opts.expires = new Date(Date.now() + maxAge)
        opts.maxAge = Math.floor(maxAge / 1000)
      }
    }

    if (opts.path == null)
      opts.path = '/';

    this.appendHeader('Set-Cookie', cookie.serialize(name, String(val), opts));

    return this;
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  sendStatus(statusCode: number): this {
    const body = HttpStatusCode[statusCode] || String(statusCode)
    this.statusCode = statusCode;
    this.contentType('txt');
    return this.send(body);
  }

  links(links: Record<string, string>): this {
    let link = this.getHeader('Link') || '';
    if (link) link += ', ';
    this.setHeader('Link', link +
        Object.keys(links)
            .map(rel => '<' + links[rel] + '>; rel="' + rel + '"')
            .join(', '));
    return this;
  }

  location(url: string) {
    let loc = url;

    // "back" is an alias for the referrer
    if (url === 'back')
      loc = this.req?.get('Referrer') || '/';

    // set location
    return this.setHeader('Location', encodeUrl(loc));
  }

  redirect(arg0: string | number, arg1?: string) {
    const address = String(arg1 || arg0);
    const status = typeof arg0 === 'number' ? arg0 : 302;
    // Set location header
    this.location(address);
    // Respond
    this.statusCode = status;
    this.end();
  }

  send(body: any) {
    let chunk = body;
    let encoding: BufferEncoding | undefined;
    const req = this.req;
    let ctype = toString(this.getHeader('Content-Type'));

    if (typeof chunk !== 'string') {
      if (chunk === null)
        chunk = '';
      else if (Buffer.isBuffer(chunk)) {
        if (!ctype)
          this.contentType('bin');
      } else {
        ctype = 'json';
        chunk = JSON.stringify(chunk);
      }
    }

    // write strings in utf-8
    if (typeof chunk === 'string') {
      encoding = 'utf-8';
      this.setHeader('Content-Type', setCharset(ctype || 'txt', encoding));
    }

    // populate Content-Length
    let len = 0;
    if (chunk !== undefined) {
      if (Buffer.isBuffer(chunk)) {
        // get length of Buffer
        len = chunk.length
      } else if (chunk.length < 1000) {
        // just calculate length when small chunk
        len = Buffer.byteLength(chunk, encoding)
      } else {
        // convert chunk to Buffer and calculate
        chunk = Buffer.from(chunk, encoding)
        encoding = undefined;
        len = chunk.length
      }
      this.setHeader('Content-Length', len);
    }

    // freshness
    if (req?.fresh)
      this.statusCode = 304;

    // strip irrelevant headers
    if (204 === this.statusCode || 304 === this.statusCode) {
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      chunk = '';
    }

    // alter headers for 205
    if (this.statusCode === 205) {
      this.setHeader('Content-Length', '0');
      this.removeHeader('Transfer-Encoding');
      chunk = ''
    }

    if (req?.method === 'HEAD') {
      // skip body for HEAD
      this.end();
    } else {
      // respond
      if (encoding)
        this.end(chunk, encoding);
      else this.end(chunk);
    }

    return this;
  }

  vary(field: string) {
    vary(this as any, field);
    return this;
  }
}


function setCharset(type: string, charset: string): string {
  if (!(type && charset))
    return type;
  // parse type
  const parsed = contentType.parse(type);
  // set charset
  parsed.parameters.charset = charset;
  // format type
  return contentType.format(parsed);
}
