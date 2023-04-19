import { splitString, tokenize } from 'fast-tokenizer';
import { HttpParams } from '../http/index.js';
import { normalizePath } from '../utils/path-utils.js';
import { OpraURLPath } from './opra-url-path.js';
import { OpraURLPathComponentInit } from './opra-url-path-component.js';
import { decodePathComponent } from './utils/decode-path-component.js';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const urlRegEx = /^(?:((?:[A-Z][A-Z+-.]+:)+)\/\/([^/?]+))?(.*)?$/i;
const schemeRegEx = /^([A-Z][A-Z+-.]+:?)+$/i;
const hostRegEx = /^([^/:]+)(?::(\d+))?$/;
const hostnameRegEx = /^([^/:]+)$/;

const kContext = Symbol('kContext');
const kPath = Symbol('kPath');
const kSearchParams = Symbol('kSearchParams');

export class OpraURL {
  protected static kContext = kContext;
  protected static kPath = kPath;
  protected static kSearchParams = kSearchParams;

  protected [kPath]: OpraURLPath;
  protected [kSearchParams]: HttpParams;
  protected [kContext]: {
    protocol: string,
    username: string,
    pathname?: string,
    prefix: string,
    hostname: string,
    port: string,
    hash: string,
    password: string,
    search?: string,
    address?: string
  } = {
    protocol: '',
    username: '',
    prefix: '',
    hostname: '',
    port: '',
    hash: '',
    password: ''
  }

  constructor(input?: string | URL | OpraURL, base?: string | URL | OpraURL) {
    this[kPath] = new OpraURLPath('', {
      onChange: () => {
        this[kContext].pathname = undefined;
        this[kContext].address = undefined;
      }
    });
    this[kSearchParams] = new HttpParams('', {
      onChange: () => {
        this[kContext].search = undefined;
      }
    });
    if (input)
      this.parse(typeof input === 'object' ? input.toString() : input);
    if (base) {
      const baseUrl = base instanceof OpraURL ? base : new OpraURL(base);
      this[kContext].protocol = baseUrl.protocol;
      this[kContext].hostname = baseUrl.hostname;
      this[kContext].port = baseUrl.port;
      this[kContext].prefix = baseUrl.pathname;
    }
  }

  get address(): string {
    if (this[kContext].address == null) {
      let address = '';
      if (this[kContext].hostname) {
        address += (this[kContext].protocol || 'http:') + '//' +
            (this[kContext].username || this[kContext].password
                ? (
                    (this[kContext].username ? encodeURIComponent(this[kContext].username) : '') +
                    (this[kContext].password ? ':' + encodeURIComponent(this[kContext].password) : '') + '@'
                )
                : '') + this.host;
      }
      this[kContext].address = address +
          (this.prefix !== '/' ? this.prefix : '') +
          (this.pathname !== '/' ? this.pathname : '');
    }
    return this[kContext].address;
  }

  get host(): string {
    return this.hostname ? (this.hostname + (this.port ? ':' + this.port : '')) : '';
  }

  set host(v: string) {
    if (v) {
      const m = hostRegEx.exec(v);
      if (!m)
        throw Object.assign(new TypeError('Invalid host'), {
          host: v,
          code: 'ERR_INVALID_URL'
        });
      this.hostname = m[1];
      this.port = m[2] || '';
    } else {
      this.hostname = '';
      this.port = '';
    }
  }

  get hostname(): string {
    return this[kContext].hostname;
  }

  set hostname(v: string) {
    if (v) {
      if (!hostnameRegEx.test(v))
        throw Object.assign(new TypeError('Invalid hostname'), {
          hostname: v,
          code: 'ERR_INVALID_URL'
        });
      this[kContext].hostname = v;
    } else this[kContext].hostname = '';
    this[kContext].address = undefined;
  }

  get href(): string {
    return this.address + this.search + this.hash;
  }

  get password(): string {
    return this[kContext].password;
  }

  set password(v: string) {
    this[kContext].password = v ?? '';
    this[kContext].address = undefined;
  }

  get port(): string {
    return this[kContext].port;
  }

  set port(value: string | number) {
    if (value) {
      // noinspection SuspiciousTypeOfGuard
      const v = typeof value === 'number' ? value : parseInt(value, 10);
      if (isNaN(v) || v < 1 || v > 35535 || v % 1 > 0)
        throw Object.assign(new TypeError('Invalid port'), {
          hostname: v,
          code: 'ERR_INVALID_URL'
        });
      this[kContext].port = String(v);
    } else this[kContext].port = '';
  }

  get prefix(): string {
    return this[kContext].prefix;
  }

  set prefix(value: string) {
    if (value) {
      const url = new OpraURL(value);
      this[kContext].prefix = url.pathname;
    } else
      this[kContext].prefix = '';
    this[kContext].address = undefined;
  }

  get protocol(): string {
    return this[kContext].protocol;
  }

  set protocol(v: string) {
    if (v) {
      if (!schemeRegEx.test(v))
        throw Object.assign(new TypeError('Invalid protocol'), {
          protocol: v,
          code: 'ERR_INVALID_URL'
        });
      this[kContext].protocol = v + (v.endsWith(':') ? '' : ':');
    } else this[kContext].protocol = '';
    this[kContext].address = undefined;
  }

  get username(): string {
    return this[kContext].username;
  }

  set username(v: string) {
    this[kContext].username = v ?? '';
    this[kContext].address = undefined;
  }

  get origin(): string {
    return this.hostname ? (this.protocol + '//' + this.hostname) : '';
  }

  get path(): OpraURLPath {
    return this[kPath];
  }

  get pathname(): string {
    if (this[kContext].pathname == null)
      this[kContext].pathname = '/' + this[kPath].toString()
    return this[kContext].pathname;
  }

  set pathname(v: string) {
    this._setPathname(v, false);
  }

  get hash(): string {
    return this[kContext].hash;
  }

  set hash(v: string) {
    this[kContext].hash = v ? (v.startsWith('#') ? v : '#' + v) : '';
  }

  get search(): string {
    if (this[kContext].search == null) {
      const s = this[kSearchParams].toString();
      this[kContext].search = s ? ('?' + s) : '';
    }
    return this[kContext].search;
  }

  set search(v: string) {
    if (v) {
      this[kSearchParams].clear();
      this[kSearchParams].appendAll(v);
    }
    this[kContext].search = undefined;
  }

  get searchParams(): HttpParams {
    return this[kSearchParams];
  }

  parse(input: string) {
    const m = urlRegEx.exec(input);
    if (!m)
      throw Object.assign(new TypeError('Invalid URL'), {
        input,
        code: 'ERR_INVALID_URL'
      });
    this.protocol = m[1];
    const isAbsolute = !!m[2];
    if (isAbsolute) {
      let tokens = splitString(m[2], {delimiters: '@'});
      if (tokens.length > 1) {
        this.host = tokens[1];
        tokens = splitString(tokens[0], {delimiters: ':'});
        this.username = tokens[0] ? decodeURIComponent(tokens[0]) : '';
        this.password = tokens[1] ? decodeURIComponent(tokens[1]) : '';
      } else this.host = tokens[0];
    } else {
      this.host = '';
      this.username = '';
      this.password = '';
    }
    input = m[3] || '';
    let tokenizer = tokenize(input, {delimiters: '#', quotes: true, brackets: true});
    input = tokenizer.next() || '';
    this.hash = tokenizer.join('#');
    tokenizer = tokenize(input, {delimiters: '?', quotes: true, brackets: true});
    this._setPathname(tokenizer.next() || '', isAbsolute);
    this.search = tokenizer.join('&');
  }

  join(...source: (string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit)[]): this {
    this.path.join(...source);
    return this;
  }

  toString() {
    return this.href
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    // this._update();
    return {
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      host: this.host,
      hostname: this.hostname,
      origin: this.origin,
      pathPrefix: this.prefix,
      path: this.path,
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
    }
  }

  //
  // protected _update() {
  //   if (!this[kContext].needUpdate)
  //     return;
  //   const ctx = this[kContext];
  //   ctx.needUpdate = false;
  //   let s = this.path.toString();
  //   ctx.pathname = s ? '/' + s : '';
  //   s = this.searchParams.toString();
  //   ctx.search = s ? '?' + s : '';
  //
  //   let address = '';
  //   if (ctx.hostname) {
  //     address += (ctx.protocol || 'http:') + '//' +
  //         (ctx.username || ctx.password
  //             ? (
  //                 (ctx.username ? encodeURIComponent(ctx.username) : '') +
  //                 (ctx.password ? ':' + encodeURIComponent(ctx.password) : '') + '@'
  //             )
  //             : '') + this.host;
  //   }
  //   ctx.address = address + ctx.prefix + ctx.pathname;
  // }

  protected _setPathname(v: string, trimPrefix?: boolean) {
    this.path.clear();
    if (!v)
      return;
    const pathTokenizer = tokenize(normalizePath(v, true), {
      delimiters: '/', quotes: true, brackets: true,
    });
    if (trimPrefix && this.prefix) {
      const prefixTokenizer = tokenize(normalizePath(this.prefix, true), {
        delimiters: '/', quotes: true, brackets: true,
      });
      for (const a of prefixTokenizer) {
        const b = pathTokenizer.next();
        if (a !== b)
          throw Object.assign(new Error('Invalid URL path. pathPrefix does not match'),
              {path: v, code: 'ERR_INVALID_URL_PATH'});
      }
    }
    for (const x of pathTokenizer) {
      const p = decodePathComponent(x);
      this.path.join(p);
    }
  }

}
