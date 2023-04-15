import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { HeaderObject } from 'http-parser-js';
import { ResponsiveMap } from '../helpers/index.js';
import { HttpHeaderCodes } from './enums/http-headers-codes.enum.js';

const knownKeys = Object.values(HttpHeaderCodes);
const knownKeysLower = knownKeys.map(x => x.toLowerCase());

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const kEntries = Symbol('kEntries');
const kOptions = Symbol('kOptions');

type HttpHeadersObject = Record<string, number | string | string[]>;

/**
 *
 * @namespace HttpHeaders
 */
export namespace HttpHeaders {
  export type Initiator = Headers | HttpHeaders | IncomingHttpHeaders | OutgoingHttpHeaders |
      HttpHeadersObject | Map<string, number | string | string[]>;

  export interface Options {
    onChange?: () => void;
  }
}


/**
 *
 * @class HttpHeaders
 */
export class HttpHeaders {
  protected static kEntries = kEntries;
  protected static kOptions = kOptions;

  protected [kEntries] = new ResponsiveMap<string, string | string[]>();
  protected [kOptions]: HttpHeaders.Options;

  constructor(init?: HttpHeaders.Initiator | string, options?: HttpHeaders.Options) {
    this[kOptions] = {...options, onChange: undefined};
    if (init) {
      if (typeof init === 'string')
        this.parse(init);
      else
        this.set(init);
    }
    this[kOptions].onChange = options?.onChange;
  }

  get size(): number {
    return this[kEntries].size;
  }

  /**
   * Appends a new value to the existing set of values for a header
   * and returns this instance
   */
  append(name: string, value: string | number | string[]): this {
    this._append(name, value);
    this.changed();
    return this;
  }

  /**
   * Appends multiple values to the existing set of values for a header
   * and returns this instance
   */
  appendAll(headers: HttpHeaders.Initiator): this {
    if (headers.forEach && typeof headers.forEach === 'function')
      headers.forEach((value, name) => this._append(name, value))
    else
      Object.keys(headers).forEach(name => this._append(name, headers[name]));
    this.changed();
    return this;
  }

  /**
   * Appends multiple values to the existing set of values for a header
   * and returns this instance
   */
  set(init: HttpHeaders.Initiator): this

  /**
   * Sets or modifies a value for a given header.
   * If the header already exists, its value is replaced with the given value
   */
  set(name: string, value: number | string | string[] | undefined): this

  set(arg0, arg1?) {
    if (typeof arg0 === 'object') {
      if (arg0.forEach && typeof arg0.forEach === 'function')
        arg0.forEach((value, name) => this._set(name, value))
      else
        Object.keys(arg0).forEach(name => this._set(name, arg0[name]));
    } else {
      if (!arg1 && arg1 !== 0)
        this[kEntries].delete(arg0);
      else
        this._set(arg0, arg1);
    }
    this.changed();
    return this;
  }

  parse(init: string): void {
    this.clear();
    init.split('\n').forEach(line => {
      const index = line.indexOf(':');
      if (index > 0) {
        const name = line.slice(0, index);
        const value = line.slice(index + 1).trim();
        if (HttpHeaders.NON_DELIMITED_HEADERS[name])
          this._append(name, value);
        else if (HttpHeaders.SEMICOLON_DELIMITED_HEADERS[name]) {
          const a = value.split(';')
          this._append(name, a.length > 1 ? a : value);
        } else {
          const a = value.split(',');
          this._append(name, a.length > 1 ? a : value);
        }
      }
    });
  }

  /**
   * Retrieves value of a given header
   */
  get(name: string): string | string[] | undefined {
    return this[kEntries].get(name);
  }

  clear(): void {
    if (this[kEntries].size) {
      this[kEntries].clear();
      this.changed();
    }
  }

  /**
   * Deletes a header entry
   */
  delete(name: string): boolean {
    if (this[kEntries].delete(name)) {
      this.changed();
      return true;
    }
    return false;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[string, string | string[]]> {
    return this[kEntries].entries();
  }

  forEach(callbackFn: (value: number | string | string[], key: string, parent: HttpHeaders) => void, thisArg?: any): void {
    const iterator = this.entries();
    let entry = iterator.next();
    while (!entry.done) {
      callbackFn.call(thisArg || this, entry.value[1], entry.value[0], this);
      entry = iterator.next();
    }
  }

  /**
   * Retrieves the names of the headers.
   */
  keys(): IterableIterator<string> {
    return this[kEntries].keys();
  }

  /**
   * Checks for existence of a given header.
   */
  has(name: string): boolean {
    return this[kEntries].has(name);
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    this[kEntries].sort(compareFn);
    this.changed();
    return this;
  }

  toObject(): HeaderObject {
    const out: any = {};
    for (const [k, v] of this.entries())
      out[k] = v;
    return out;
  }

  getProxy(): HttpHeadersObject {
    const _this = this;
    return new Proxy<Record<string, number | string | string[]>>({}, {
      get(target, p: string | symbol, receiver: any): any {
        if (typeof p === 'string')
          return _this.get(p);
        return Reflect.get(target, p, receiver);
      },
      set(target, p: string | symbol, newValue: any, receiver: any): boolean {
        if (typeof p === 'string') {
          _this.set(p, newValue);
          return true;
        }
        return Reflect.set(target, p, newValue, receiver);
      },
      has(target, p: string | symbol): boolean {
        if (typeof p === 'string')
          return _this.has(p);
        return Reflect.has(target, p);
      },
      ownKeys(): ArrayLike<string | symbol> {
        return Array.from(_this.keys()).map(x => x.toLowerCase());
      },
      getPrototypeOf(): object | null {
        return Object.getPrototypeOf(_this);
      },
      defineProperty(target, property: string | symbol, attributes: PropertyDescriptor): boolean {
        if (typeof property === 'string') {
          _this.set(property, attributes.value);
          return true;
        }
        return false;
      },
      deleteProperty(target, p: string | symbol): boolean {
        if (typeof p === 'string')
          return _this.delete(p);
        return false;
      },
      getOwnPropertyDescriptor(target, key) {
        if (typeof key === 'string') {
          const value = _this.get(key);
          return {configurable: true, enumerable: true, writable: true, value};
        }
      },
    });
  }

  [nodeInspectCustom]() {
    return this[kEntries];
  }

  [Symbol.iterator](): IterableIterator<[string, number | string | string[]]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'HttpHeaders';
  }

  protected _append(name: string, value: any) {
    const i = knownKeysLower.indexOf(name.toLowerCase());
    const normalizedName = knownKeys[i] || name;
    name = name.toLowerCase();
    let stored = this[kEntries].get(normalizedName);

    if (HttpHeaders.NON_DELIMITED_HEADERS[name]) {
      value = String(Array.isArray(value) ? value[0] : value);
      this[kEntries].set(normalizedName, value);
      return;
    }

    if (HttpHeaders.ARRAY_HEADERS[name]) {
      stored = (stored ? [stored, value] : [value])
          .flat().map(String);
      this[kEntries].set(normalizedName, stored);
      return;
    }

    const arr = stored ? [stored] : [];
    if (Array.isArray(value))
      arr.push(...value);
    else arr.push(value);
    this[kEntries].set(normalizedName,
        arr.join(HttpHeaders.SEMICOLON_DELIMITED_HEADERS[name] ? '; ' : ', ')
    );
  }

  protected _set(name: string, value: any): void {
    this[kEntries].delete(name);
    if (!value && value !== 0)
      return;
    this._append(name, value);
  }

  protected changed(): void {
    if (this[kOptions].onChange)
      this[kOptions].onChange();
  }

  static NON_DELIMITED_HEADERS: any = {
    'age': true,
    'from': true,
    'etag': true,
    'server': true,
    'referer': true,
    'expires': true,
    'location': true,
    'user-agent': true,
    'retry-after': true,
    'content-type': true,
    'content-length': true,
    'max-forwards': true,
    'last-modified': true,
    'authorization': true,
    'proxy-authorization': true,
    'if-modified-since': true,
    'if-unmodified-since': true
  };
  static SEMICOLON_DELIMITED_HEADERS: any = {'cookie': true};
  static ARRAY_HEADERS: any = {'set-cookie': true};
}

