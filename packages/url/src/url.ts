import { splitString, tokenize } from 'fast-tokenizer';
import { Expression } from './filter/ast/index.js';
import { nodeInspectCustom, ResourceKey } from './types.js';
import { OpraURLPath } from './url-path.js';
import { OpraURLSearchParams, QueryItemMetadata } from './url-search-params.js';
import { decodePathComponent, normalizePath } from './utils/url-utils.js';

const urlRegEx = /^(?:((?:[A-Z][A-Z+-.]+:)+)\/\/([^/]+))?(\/.*)?$/i;
const schemeRegEx = /^([A-Z][A-Z+-.]+:?)+$/i;
const hostRegEx = /^([^/:]+)(?::(\d+))?$/;
const hostnameRegEx = /^([^/:]+)$/;

const CONTEXT_KEY = Symbol.for('opra.url.context');
const PATH_KEY = Symbol.for('opra.url.path');
const SEARCHPARAMS_KEY = Symbol.for('opra.url.searchparams');

export class OpraURL {
  protected [CONTEXT_KEY]: {
    protocol: string;
    username: string;
    password: string;
    hostname: string;
    pathPrefix: string;
    port: number | null;
    hash: string;
    pathname: string;
    search: string;
    needUpdate: boolean;
  }
  protected [PATH_KEY]: OpraURLPath;
  protected [SEARCHPARAMS_KEY]: OpraURLSearchParams;

  constructor(input?: string, pathPrefix?: string) {
    Object.defineProperty(this, CONTEXT_KEY, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: {}
    });
    Object.defineProperty(this, PATH_KEY, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: new OpraURLPath()
    })
    Object.defineProperty(this, SEARCHPARAMS_KEY, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: new OpraURLSearchParams()
    });
    this.searchParams.on('change', () => this._invalidate());
    this.path.on('change', () => this._invalidate());
    if (pathPrefix)
      this.setPrefix(pathPrefix);
    if (input)
      this.parse(input);
  }

  get href(): string {
    this._update();
    return (this.hostname ? (
                this.protocol + '//' +
                (this.username || this.password
                    ? (
                        (this.username ? encodeURIComponent(this.username) : '') +
                        (this.password ? ':' + encodeURIComponent(this.password) : '') + '@'
                    )
                    : '') + this.host
            ) : ''
        ) +
        this.pathPrefix + this.pathname + this.search + this.hash;
  }

  get protocol(): string {
    return this[CONTEXT_KEY].protocol || 'http:';
  }

  set protocol(v: string) {
    if (!schemeRegEx.test(v))
      throw Object.assign(new TypeError('Invalid protocol'), {
        protocol: v,
        code: 'ERR_INVALID_URL'
      });
    this[CONTEXT_KEY].protocol = v + (v.endsWith(':') ? '' : ':');
  }

  get username(): string {
    return this[CONTEXT_KEY].username || '';
  }

  set username(v: string) {
    this[CONTEXT_KEY].username = v;
  }

  get password(): string {
    return this[CONTEXT_KEY].password || '';
  }

  set password(v: string) {
    this[CONTEXT_KEY].password = v;
  }

  get host(): string {
    return this.hostname ? (this.hostname + (this.port ? ':' + this.port : '')) : '';
  }

  set host(v: string) {
    const m = hostRegEx.exec(v);
    if (!m)
      throw Object.assign(new TypeError('Invalid host'), {
        host: v,
        code: 'ERR_INVALID_URL'
      });
    this[CONTEXT_KEY].hostname = m[1];
    this[CONTEXT_KEY].port = m[2] ? parseInt(m[2], 10) : null;
  }

  get hostname(): string {
    return this[CONTEXT_KEY].hostname || '';
  }

  set hostname(v: string) {
    if (!hostnameRegEx.test(v))
      throw Object.assign(new TypeError('Invalid hostname'), {
        hostname: v,
        code: 'ERR_INVALID_URL'
      });
    this[CONTEXT_KEY].hostname = v;
  }

  get port(): number | null {
    const v = this[CONTEXT_KEY].port;
    return v == null ? null : v;
  }

  set port(v: number | null) {
    if (v == null) {
      this[CONTEXT_KEY].port = null;
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof v !== 'number' || isNaN(v) || v < 1 || v > 35535 || v % 1 > 0)
      throw Object.assign(new TypeError('Invalid port'), {
        hostname: v,
        code: 'ERR_INVALID_URL'
      });
    this[CONTEXT_KEY].port = v;
  }

  get origin(): string {
    return this.hostname ? (this.protocol + '//' + this.hostname) : '';
  }

  get pathPrefix(): string {
    return this[CONTEXT_KEY].pathPrefix || '';
  }

  set pathPrefix(v: string) {
    if (!v) {
      this[CONTEXT_KEY].pathPrefix = '';
      return;
    }
    v = normalizePath(tokenize(v, {delimiters: '#?', quotes: true, brackets: true}).next() || '', true);
    this[CONTEXT_KEY].pathPrefix = v ? '/' + v : '';
  }

  get path(): OpraURLPath {
    return this[PATH_KEY];
  }

  get pathname(): string {
    this._update();
    return this[CONTEXT_KEY].pathname || '';
  }

  set pathname(v: string) {
    this._setPathname(v, false);
  }

  get searchParams(): OpraURLSearchParams {
    return this[SEARCHPARAMS_KEY];
  }

  get hash(): string {
    return this[CONTEXT_KEY].hash || '';
  }

  set hash(v: string) {
    this[CONTEXT_KEY].hash = v ? (v.startsWith('#') ? v : '#' + v) : '';
  }

  get search(): string {
    this._update();
    return this[CONTEXT_KEY].search || '';
  }

  set search(v: string) {
    this.searchParams.parse(v);
  }

  addPath(name: string, key?: ResourceKey): this {
    this.path.add(name, key);
    return this;
  }

  addSearchParam(name: string, value?: any): this {
    this.searchParams.append(name, value);
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

  setPort(v: number | null): this {
    this.port = v;
    return this;
  }

  setPrefix(v: string): this {
    this.pathPrefix = v;
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

  setSearchParam(name: string, value?: any): this {
    this.searchParams.set(name, value);
    return this;
  }

  setFilter(v?: string | Expression): this {
    if (v == null)
      this.searchParams.delete('filter');
    else {
      this.searchParams.set('filter', v);
    }
    return this;
  }

  setLimit(v?: number | null): this {
    if (v == null)
      this.searchParams.delete('limit');
    else
      this.searchParams.set('limit', v);
    return this;
  }

  setSkip(v?: number | null): this {
    if (v == null)
      this.searchParams.delete('skip');
    else
      this.searchParams.set('skip', v);
    return this;
  }

  setElements(...v: string[]): this {
    if (!v.length)
      this.searchParams.delete('elements');
    else
      this.searchParams.set('elements', v);
    return this;
  }

  setExclude(...v: string[]): this {
    if (!v.length)
      this.searchParams.delete('exclude');
    else
      this.searchParams.set('exclude', v);
    return this;
  }

  setInclude(...v: string[]): this {
    if (!v.length)
      this.searchParams.delete('include');
    else
      this.searchParams.set('include', v);
    return this;
  }

  setDistinct(v?: boolean | null): this {
    if (v == null)
      this.searchParams.delete('distinct');
    else
      this.searchParams.set('distinct', v);
    return this;
  }

  setTotal(v?: boolean | null): this {
    if (v == null)
      this.searchParams.delete('total');
    else
      this.searchParams.set('total', v);
    return this;
  }


  parse(input: string): this {
    const m = urlRegEx.exec(input);
    if (!m)
      throw Object.assign(new TypeError('Invalid URL'), {
        input,
        code: 'ERR_INVALID_URL'
      });
    if (m[1])
      this.protocol = m[1];
    if (m[2]) {
      let tokens = splitString(m[2], {delimiters: '@'});
      if (tokens.length > 1) {
        this.host = tokens[1];
        tokens = splitString(tokens[0], {delimiters: ':'});
        this.username = tokens[0] ? decodeURIComponent(tokens[0]) : '';
        this.password = tokens[1] ? decodeURIComponent(tokens[1]) : '';
      } else this.host = tokens[0];
    }
    input = m[3] || '';
    let tokenizer = tokenize(input, {delimiters: '#', quotes: true, brackets: true});
    input = tokenizer.next() || '';
    this.hash = tokenizer.join('#');
    tokenizer = tokenize(input, {delimiters: '?', quotes: true, brackets: true});
    this._setPathname(tokenizer.next() || '', true);
    this.searchParams.clear();
    this.searchParams.parse(tokenizer.join('&'));
    return this;
  }

  defineSearchParam(name: string, options?: Omit<QueryItemMetadata, 'name'>): this {
    this.searchParams.defineParam(name, options);
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
      pathPrefix: this.pathPrefix,
      path: this.path,
      pathname: this.pathname,
      search: this.search,
      searchParams: this.searchParams,
      hash: this.hash,
    }
  }

  protected _invalidate(): void {
    this[CONTEXT_KEY].needUpdate = true;
  }

  protected _update() {
    if (!this[CONTEXT_KEY].needUpdate)
      return;
    this[CONTEXT_KEY].needUpdate = false;
    let s = this.path.toString();
    this[CONTEXT_KEY].pathname = s ? '/' + s : '';
    s = this.searchParams.toString();
    this[CONTEXT_KEY].search = s ? '?' + s : '';
  }

  protected _setPathname(v: string, inclSvcRoot?: boolean) {
    this.path.clear();
    if (!v)
      return;
    const pathTokenizer = tokenize(normalizePath(v, true), {
      delimiters: '/', quotes: true, brackets: true,
    });
    if (inclSvcRoot && this.pathPrefix) {
      const prefixTokenizer = tokenize(normalizePath(this.pathPrefix, true), {
        delimiters: '/', quotes: true, brackets: true,
      });
      for (const x of prefixTokenizer) {
        if (x !== pathTokenizer.next())
          throw Object.assign(new Error('Invalid URL path. pathPrefix does not match'),
              {path: v, code: 'ERR_INVALID_URL_PATH'});
      }
    }
    for (const x of pathTokenizer) {
      const p = decodePathComponent(x);
      this.path.add(p);
    }
  }

}
