import { splitString, tokenize } from 'fast-tokenizer';
import type { HttpParamDefinition } from '../http/http-params.js';
import { OpraURLPath } from './opra-url-path.js';
import { OpraURLPathComponentInit } from './opra-url-path-component.js';
import { OpraURLSearchParams } from './opra-url-search-params.js';
import { decodePathComponent, normalizePath } from './utils/path-utils.js';

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

  protected [kContext] = {
    protocol: '',
    username: '',
    pathname: '',
    prefix: '',
    hostname: '',
    port: '',
    hash: '',
    password: '',
    search: '',
    address: '',
    needUpdate: true
  }
  protected [kPath]: OpraURLPath;
  protected [kSearchParams]: OpraURLSearchParams;

  constructor(input?: string | URL | OpraURL, base?: string | URL | OpraURL)
  constructor(input?: string | URL | OpraURL, options?: {
    base?: string | URL | OpraURL,
    params?: Record<string, HttpParamDefinition>;
  })
  constructor(input?: string | URL | OpraURL, arg1?: any) {
    this[kPath] = new OpraURLPath('', {
      onChange: () => this._changed()
    });
    this[kSearchParams] = new OpraURLSearchParams('', {
      onChange: () => this._changed()
    });
    const base = typeof arg1 === 'object' ? arg1.base : arg1;
    if (typeof arg1 === 'object') {
      const defineParams = arg1?.params;
      if (defineParams)
        Object.keys(defineParams).forEach(key => this.searchParams.define(key, defineParams[key]));
    }
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
    this._update();
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
      this[kContext].hostname = m[1];
      this[kContext].port = m[2] || '';
    } else {
      this[kContext].hostname = '';
      this[kContext].port = '';
    }
    this._changed();
  }

  get hostname(): string {
    return this[kContext].hostname || '';
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
    this._changed();
  }

  get href(): string {
    return this.address + this.search + this.hash;
  }

  get password(): string {
    return this[kContext].password;
  }

  set password(v: string) {
    this[kContext].password = v || '';
    this._changed();
  }

  get port(): string {
    return this[kContext].port;
  }

  set port(value: string) {
    if (value) {
      // noinspection SuspiciousTypeOfGuard
      const v = parseInt(value, 10);
      if (isNaN(v) || v < 1 || v > 35535 || v % 1 > 0)
        throw Object.assign(new TypeError('Invalid port'), {
          hostname: v,
          code: 'ERR_INVALID_URL'
        });
      this[kContext].port = value;
    } else this[kContext].port = '';
    this._changed();
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
    this._changed();
  }

  get protocol(): string {
    return this[kContext].protocol || 'http:';
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
    this._changed();
  }

  get username(): string {
    return this[kContext].username;
  }

  set username(v: string) {
    this[kContext].username = v || '';
    this._changed();
  }


  get origin(): string {
    return this.hostname ? (this.protocol + '//' + this.hostname) : '';
  }

  get path(): OpraURLPath {
    return this[kPath];
  }

  get pathname(): string {
    this._update();
    return this[kContext].pathname || '';
  }

  set pathname(v: string) {
    this._setPathname(v, false);
  }

  get searchParams(): OpraURLSearchParams {
    return this[kSearchParams];
  }

  get hash(): string {
    return this[kContext].hash || '';
  }

  set hash(v: string) {
    this[kContext].hash = v ? (v.startsWith('#') ? v : '#' + v) : '';
    this._changed();
  }

  get search(): string {
    this._update();
    return this[kContext].search || '';
  }

  set search(v: string) {
    this.searchParams.clear();
    this.searchParams.appendAll(v);
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
    this.searchParams.clear();
    this.searchParams.appendAll(tokenizer.join('&'));
    this._changed();
  }

  join(...source: (string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit)[]): this {
    this.path.join(...source);
    return this;
  }

  addParam(name: string, value?: any): this {
    this.searchParams.append(name, value);
    return this;
  }

  setParam(name: string, value?: any): this {
    this.searchParams.set(name, value);
    return this;
  }

  setHost(v: string): this {
    this.host = v;
    return this;
  }

  setHostname(v: string): this {
    this.hostname = v;
    return this;
  }

  setProtocol(v: string): this {
    this.protocol = v;
    return this;
  }

  setPort(v: string | number | null): this {
    this.port = v ? String(v) : '';
    return this;
  }

  setPrefix(v: string): this {
    this.prefix = v;
    return this;
  }

  setPathname(v: string): this {
    this.pathname = v;
    return this;
  }

  setHash(v: string): this {
    this.hash = v;
    return this;
  }

  setSearch(v: string): this {
    this.search = v;
    return this;
  }


  toString() {
    return this.href
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    this._update();
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
      searchParams: this.searchParams,
      hash: this.hash,
    }
  }

  protected _update() {
    if (!this[kContext].needUpdate)
      return;
    const ctx = this[kContext];
    ctx.needUpdate = false;
    let s = this.path.toString();
    ctx.pathname = s ? '/' + s : '';
    s = this.searchParams.toString();
    ctx.search = s ? '?' + s : '';

    let address = '';
    if (ctx.hostname) {
      address += (ctx.protocol || 'http:') + '//' +
          (ctx.username || ctx.password
              ? (
                  (ctx.username ? encodeURIComponent(ctx.username) : '') +
                  (ctx.password ? ':' + encodeURIComponent(ctx.password) : '') + '@'
              )
              : '') + this.host;
    }
    ctx.address = address + ctx.prefix + ctx.pathname;
  }

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
    this._changed();
  }

  protected _changed() {
    this[kContext].needUpdate = true;
  }

}
