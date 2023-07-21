import { StrictOmit } from 'ts-gems';

export interface ResponsiveMapOptions {
  wellKnownKeys?: string[];
  caseSensitive?: boolean;
}

export type ResponsiveMapInit<V> = ResponsiveMap<V> | Map<string, V> | Record<any, V>;

function isMap(v): v is Map<any, any> {
  return v && typeof v.forEach === 'function';
}

const kKeyMap = Symbol('kKeyMap');
const kKeyOrder = Symbol('kKeyOrder');
const kWellKnownKeys = Symbol('kWellKnownKeys');
const kOptions = Symbol('kOptions');

/**
 * A Map implementation that supports case-insensitivity and ordered keys
 */
export class ResponsiveMap<V> extends Map<string, V> {
  private [kKeyMap] = new Map<string, string>();
  private [kKeyOrder]: string[] = [];
  private [kWellKnownKeys] = new Map<string, string>();
  private [kOptions]: StrictOmit<ResponsiveMapOptions, 'wellKnownKeys'> = {caseSensitive: false};

  constructor(init?: ResponsiveMapInit<V> | null, options?: ResponsiveMapOptions) {
    super();
    this[kOptions].caseSensitive = !!options?.caseSensitive;
    if (options?.wellKnownKeys)
      options.wellKnownKeys.forEach(k => this[kWellKnownKeys].set(k.toLowerCase(), k));
    if (init)
      this.setAll(init);
  }

  clear() {
    super.clear();
    this[kKeyMap].clear();
    this[kKeyOrder] = [];
  }

  get(key: string): V | undefined {
    const orgKey = this._getOriginalKey(key);
    return super.get(orgKey as string);
  }

  has(key: string): boolean {
    return this[kKeyMap].has(this._getStoringKey(key));
  }

  set(key: string, value: V): this {
    key = this._getOriginalKey(key);
    this[kKeyMap].set(this._getStoringKey(key), key);
    if (!this[kKeyOrder].includes(key))
      this[kKeyOrder].push(key);
    return super.set(key, value);
  }

  setAll(source: ResponsiveMapInit<V>): this {
    if (isMap(source))
      source.forEach((v, k) => this.set(k, v));
    else
      Object.keys(source).forEach(k => this.set(k, source[k]));
    return this;
  }

  keys(): IterableIterator<string> {
    return this[kKeyOrder][Symbol.iterator]();
  }

  values(): IterableIterator<V> {
    let i = -1;
    const arr = this[kKeyOrder];
    const map = this;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: map.get(arr[i]) as V
        }
      }
    };
  }

  entries(): IterableIterator<[string, V]> {
    let i = -1;
    const arr = this[kKeyOrder];
    const map = this;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: [arr[i], map.get(arr[i]) as V]
        }
      }
    };
  }

  delete(key: string): boolean {
    const orgKey = this._getOriginalKey(key);
    const k = this._getStoringKey(key);
    this[kKeyMap].delete(k);
    const i = this[kKeyOrder].indexOf(orgKey);
    if (i >= 0)
      this[kKeyOrder].splice(i, 1);
    return super.delete(orgKey);
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    if (compareFn)
      this[kKeyOrder].sort(compareFn);
    else if (this[kOptions].caseSensitive)
      this[kKeyOrder].sort();
    else
      this[kKeyOrder].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    return this;
  }

  getProxy(handler?: ProxyHandler<Record<string, V>>): Record<string, V> {
    const _this = this;
    const finalHandler = {
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
        return Object.prototype;
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
          const value = finalHandler.get(target, key);
          return {configurable: true, enumerable: true, writable: true, value};
        }
      },
      ...handler
    }
    return new Proxy<Record<string, V>>({}, finalHandler);
  }

  [Symbol.iterator](): IterableIterator<[string, V]> {
    return this.entries();
  }

  protected _getOriginalKey(key: string): string {
    if (!key || this[kOptions].caseSensitive)
      return key;
    return this[kKeyMap].get(key.toLowerCase()) ??
        (this[kWellKnownKeys].get(key.toLowerCase()) ?? key);
  }

  protected _getStoringKey(key: string): string {
    if (this[kOptions].caseSensitive)
      return key;
    return key.toLowerCase() as string;
  }
}
