import {URL} from 'url';
import {BooleanFormat} from './formats/boolean-format';
import {FilterFormat} from './formats/filter-format';
import {Format} from './formats/format';
import {IntegerFormat} from './formats/integer-format';
import {NumberFormat} from './formats/number-format';
import {StringFormat} from './formats/string-format';
import {InternalFormatName, nodeInspectCustom, ResourceKey} from './types';
import {OwoURLPath} from './url-path';
import {OwoURLSearchParams} from './url-search-params';
import {decodePathComponent, normalizePath} from './utils/path-utils';
import {splitString, tokenize} from './utils/tokenizer';

const urlRegEx = /^((?:[A-Z][A-Z+-.]+:)+)\/\/([^/]+)(\/.*)?$/i;
const schemeRegEx = /^([A-Z][A-Z+-.]+:?)+$/i;
const hostRegEx = /^([^/:]+)(?::(\d+))?$/;
const hostnameRegEx = /^([^/:]+)$/;

const CONTEXT_KEY = Symbol.for('owo.url.context');
const PATH_KEY = Symbol.for('owo.url.path');
const SEARCHPARAMS_KEY = Symbol.for('owo.url.searchparams');
const QUERYMETADATA_KEY = Symbol.for('owo.url.querymetadata');

export interface QueryItemMetadata {
  name: string;
  format: Format;
}

export class OwoURL {
  static formats: Record<string, Format> = {};
  protected [CONTEXT_KEY]: {
    baseUrl: URL;
    protocol: string;
    username: string;
    password: string;
    hostname: string;
    prefix: string;
    port: number | null;
    hash: string;
    pathname: string;
    search: string;
    needUpdate: boolean;
  }
  protected [PATH_KEY]: OwoURLPath;
  protected [SEARCHPARAMS_KEY]: OwoURLSearchParams;
  protected [QUERYMETADATA_KEY]: Record<string, QueryItemMetadata>;

  constructor(input?: string, prefix?: string) {
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
      value: new OwoURLPath()
    })
    Object.defineProperty(this, SEARCHPARAMS_KEY, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: new OwoURLSearchParams('', (v: string, name) => {
        const queryItems = this[QUERYMETADATA_KEY];
        const qm = queryItems && queryItems[name.toLowerCase()];
        return qm ? qm.format.parse(v, name) : v;
      })
    });
    this.defineQueryItem('_filter', new FilterFormat());
    this.defineQueryItem('_limit', new NumberFormat({min: 0}));
    this.defineQueryItem('_skip', new NumberFormat({min: 0}));
    this.defineQueryItem('_elements', new StringFormat({maxOccurs: Infinity}));
    this.defineQueryItem('_exclude', new StringFormat({maxOccurs: Infinity}));
    this.defineQueryItem('_include', new StringFormat({maxOccurs: Infinity}));
    this.defineQueryItem('_distinct', new BooleanFormat());
    this.defineQueryItem('_total', new BooleanFormat());
    this.path.on('change', () => this._invalidate());
    this.searchParams.on('change', () => this._invalidate());
    if (prefix)
      this.setPrefix(prefix);
    this.parse(input || 'http://tempuri.org');
  }

  get href(): string {
    this._update();
    return this.protocol + '//' +
      (this.username || this.password
        ? (
          (this.username ? encodeURIComponent(this.username) : '') +
          (this.password ? ':' + encodeURIComponent(this.password) : '') + '@'
        )
        : '') +
      this.host + this.prefix + this.pathname + this.search + this.hash;
  }

  get protocol(): string {
    return this[CONTEXT_KEY].protocol;
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
    return this[CONTEXT_KEY].username;
  }

  set username(v: string) {
    this[CONTEXT_KEY].username = v;
  }

  get password(): string {
    return this[CONTEXT_KEY].password;
  }

  set password(v: string) {
    this[CONTEXT_KEY].password = v;
  }

  get host(): string {
    return this[CONTEXT_KEY].hostname + (this[CONTEXT_KEY].port ? ':' + this[CONTEXT_KEY].port : '');
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
    return this[CONTEXT_KEY].hostname;
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
    return this[CONTEXT_KEY].protocol + this[CONTEXT_KEY].hostname;
  }

  get prefix(): string {
    return this[CONTEXT_KEY].prefix || '';
  }

  set prefix(v: string) {
    if (!v) {
      this[CONTEXT_KEY].prefix = '';
      return;
    }
    v = tokenize(v, {delimiters: '#?', quotes: true, brackets: true}).next() || '';
    this[CONTEXT_KEY].prefix = normalizePath(v);
  }

  get pathname(): string {
    this._update();
    return this[CONTEXT_KEY].pathname;
  }

  set pathname(v: string) {
    this._setPathname(v, false);
  }


  get searchParams(): OwoURLSearchParams {
    return this[SEARCHPARAMS_KEY];
  }

  get hash(): string {
    return this[CONTEXT_KEY].hash || '';
  }

  set hash(v: string) {
    this[CONTEXT_KEY].hash = v ? (v.startsWith('#') ? v : '#' + v) : '';
  }

  get path(): OwoURLPath {
    return this[PATH_KEY];
  }


  get search(): string {
    this._update();
    return this[CONTEXT_KEY].search;
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

  setPrefix(v: string): this {
    this.prefix = v;
    return this;
  }

  setHash(v: string): this {
    this.hash = v;
    return this;
  }

  setSearchParam(name: string, value?: any): this {
    this.searchParams.set(name, value);
    return this;
  }

  setLimit(v: number | undefined): this {
    this.searchParams.set('_limit', v);
    return this;
  }

  defineQueryItem(name: string, format: Format | InternalFormatName | string): this {
    const queryItems = this[QUERYMETADATA_KEY] = this[QUERYMETADATA_KEY] || {};
    const key = name.toLowerCase();
    let fmt: Format;
    if (typeof format === 'string') {
      const formats = Object.getPrototypeOf(this).constructor.formats;
      const intlFormat: any = formats[format];
      if (!intlFormat)
        throw new Error(`Unknown format "${format}"`);
      fmt = intlFormat;
    } else fmt = format;
    queryItems[key] = {
      name,
      format: fmt
    }
    return this;
  }

  parse(input: string): this {
    const m = urlRegEx.exec(input);
    if (!m)
      throw Object.assign(new TypeError('Invalid URL'), {
        input,
        code: 'ERR_INVALID_URL'
      });
    this.protocol = m[1];
    let tokens = splitString(m[2], {delimiters: '@'});
    if (tokens.length > 1) {
      this.host = tokens[1];
      tokens = splitString(tokens[0], {delimiters: ':'});
      this.username = tokens[0] ? decodeURIComponent(tokens[0]) : '';
      this.password = tokens[1] ? decodeURIComponent(tokens[1]) : '';
    } else this.host = tokens[0];
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

  toString() {
    return this.href
  }

  [nodeInspectCustom]() {
    this._update();
    return {
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      host: this.host,
      hostname: this.hostname,
      origin: this.origin,
      prefix: this.prefix,
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
    if (!v) {
      this.path.clear();
      return;
    }
    const pathTokenizer = tokenize(normalizePath(v), {
      delimiters: '/', quotes: true, brackets: true,
    });
    if (inclSvcRoot && this.prefix) {
      const prefixTokenizer = tokenize(normalizePath(this.prefix), {
        delimiters: '/', quotes: true, brackets: true,
      });
      for (const x of prefixTokenizer) {
        if (x !== pathTokenizer.next())
          throw Object.assign(new Error('Invalid URL path. Prefix does not match'),
            {path: v, code: 'ERR_INVALID_URL_PATH'});
      }
    }
    for (const x of pathTokenizer) {
      const r = decodePathComponent(x);
      this.path.add(r.resource, r.key);
    }
  }

  static registerFormat(name: string, format: Format) {
    this.formats[name] = format;
  }
}

OwoURL.registerFormat('integer', new IntegerFormat());
OwoURL.registerFormat('integer[]', new IntegerFormat({maxOccurs: Infinity}));
OwoURL.registerFormat('number', new NumberFormat());
OwoURL.registerFormat('number[]', new NumberFormat({maxOccurs: Infinity}));
OwoURL.registerFormat('string', new StringFormat());
OwoURL.registerFormat('string[]', new StringFormat({maxOccurs: Infinity}));
OwoURL.registerFormat('boolean', new BooleanFormat());
OwoURL.registerFormat('filter', new FilterFormat());
