import { splitString, tokenize } from 'fast-tokenizer';
import { OpraURLPath } from './opra-url-path.js';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const urlRegEx = /^(?:((?:[A-Z][A-Z+-.]+:)+)\/\/([^/?]+))?(.*)?$/i;
const schemeRegEx = /^([A-Z][A-Z+-.]+:?)+$/i;
const hostRegEx = /^([^/:]+)(?::(\d+))?$/;
const hostnameRegEx = /^([^/:]+)$/;

const kContext = Symbol.for('kContext');
const kPath = Symbol.for('kPath');
const kSearchParams = Symbol.for('kSearchParams');

export class OpraURL {
  protected static kContext = kContext;
  protected static kPath = kPath;
  protected static kParams = kSearchParams;

  protected [kPath]: OpraURLPath;
  protected [kSearchParams]: URLSearchParams;
  protected [kContext]: {
    protocol: string,
    username: string,
    pathname?: string,
    hostname: string,
    port: string,
    hash: string,
    password: string,
    address?: string
  } = {
    protocol: '',
    username: '',
    hostname: '',
    port: '',
    hash: '',
    password: ''
  }

  constructor(input?: string | URL | OpraURL, base?: string | URL | OpraURL) {
    this[kSearchParams] = new URLSearchParams();
    this[kPath] = new OpraURLPath();
    if (input)
      this._parse(String(input));
    if (base && !this.host) {
      const baseUrl = base instanceof OpraURL ? base : new OpraURL(base);
      this[kContext].protocol = baseUrl.protocol;
      this[kContext].hostname = baseUrl.hostname;
      this[kContext].username = baseUrl.username;
      this[kContext].password = baseUrl.password;
      this[kContext].port = baseUrl.port;
      this.path = OpraURLPath.join(baseUrl.path, this.path);
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
    this.invalidate();
  }

  get href(): string {
    return this.address + this.search + this.hash;
  }

  get password(): string {
    return this[kContext].password;
  }

  set password(v: string) {
    this[kContext].password = v ?? '';
    this.invalidate();
  }

  get port(): string {
    return this[kContext].port;
  }

  set port(value: string | number) {
    if (value) {
      // noinspection SuspiciousTypeOfGuard
      const v = typeof value === 'number' ? value : parseInt(value, 10);
      if (isNaN(v) || v < 1 || v > 65535 || v % 1 > 0)
        throw Object.assign(new TypeError(`Invalid port number (${value})`), {
          hostname: v,
          code: 'ERR_INVALID_URL'
        });
      this[kContext].port = String(v);
    } else this[kContext].port = '';
    this.invalidate();
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
    this.invalidate();
  }

  get username(): string {
    return this[kContext].username;
  }

  set username(v: string) {
    this[kContext].username = v ?? '';
    this.invalidate();
  }

  get origin(): string {
    return this.hostname ? (this.protocol + '//' + this.hostname) : '';
  }

  get path(): OpraURLPath {
    return this[kPath];
  }

  set path(path: OpraURLPath) {
    // noinspection SuspiciousTypeOfGuard
    this[kPath] = path instanceof OpraURLPath ? path : new OpraURLPath(path);
    this[kContext].pathname = String(this[kPath]);
    this.invalidate();
  }

  get pathname(): string {
    if (this[kContext].pathname == null)
      this[kContext].pathname = this.path.toString() || '/';
    return this[kContext].pathname;
  }

  set pathname(v: string) {
    this[kPath] = new OpraURLPath(v);
    this.invalidate();
  }

  get hash(): string {
    return this[kContext].hash;
  }

  set hash(v: string) {
    this[kContext].hash = v ? (v.startsWith('#') ? v : '#' + v) : '';
  }

  get search(): string {
    const s = this[kSearchParams].toString();
    return s ? '?' + s : '';
  }

  set search(v: string) {
    this[kSearchParams] = new URLSearchParams(v);
  }

  get searchParams(): URLSearchParams {
    return this[kSearchParams];
  }

  set setSearchParams(v: URLSearchParams) {
    this[kSearchParams] = v;
  }

  invalidate(): void {
    this[kContext].address = undefined;
    this[kContext].pathname = undefined;
  }

  join(...items: OpraURLPath.ComponentLike[]): this {
    this.path = this.path.join(...items);
    this.invalidate();
    return this;
  }

  resolve(...items: OpraURLPath.ComponentLike[]): OpraURL {
    this.path = this.path.resolve(...items);
    this.invalidate();
    return this;
  }

  toString() {
    return this.href
  }

  protected _parse(input: string) {
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
    this.path = new OpraURLPath(tokenizer.next());
    this.search = tokenizer.join('&');
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
      path: this.path,
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
    }
  }

}
