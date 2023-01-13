export interface ResponsiveMapOptions {
  wellKnownKeys?: string[];
  caseSensitive?: boolean;
}

export type ResponsiveMapInit<K, V> = ResponsiveMap<K, V> | Map<K, V> | Record<any, V>;

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
export class ResponsiveMap<K, V> extends Map<K, V> {
  private [kKeyMap] = new Map<K, K>();
  private [kKeyOrder]: K[] = [];
  private [kWellKnownKeys] = new Map<string, string>();
  private [kOptions] = {caseSensitive: false};

  constructor(init?: ResponsiveMapInit<K, V>, options?: ResponsiveMapOptions) {
    super();
    this[kOptions].caseSensitive = !!options?.caseSensitive;
    if (options?.wellKnownKeys)
      options.wellKnownKeys.forEach(k => this[kWellKnownKeys].set(k.toLowerCase(), k));
    if (isMap(init)) {
      init.forEach((v, k) => this.set(k, v));
    } else if (init && typeof init === 'object')
      Object.keys(init).forEach(k => this.set(k as K, init[k]));
  }

  clear() {
    super.clear();
    this[kKeyMap].clear();
    this[kKeyOrder] = [];
  }

  get(key: K): V | undefined {
    const orgKey = this._getOriginalKey(key);
    return super.get(orgKey as K);
  }

  has(key: K): boolean {
    return this[kKeyMap].has(this._getStoringKey(key));
  }

  set(key: K, value: V): this {
    key = this._getOriginalKey(key);
    this[kKeyMap].set(this._getStoringKey(key), key);
    if (!this[kKeyOrder].includes(key))
      this[kKeyOrder].push(key);
    return super.set(key, value);
  }

  keys(): IterableIterator<K> {
    return this[kKeyOrder].values();
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

  entries(): IterableIterator<[K, V]> {
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

  delete(key: K): boolean {
    const orgKey = this._getOriginalKey(key);
    const k = this._getStoringKey(key);
    this[kKeyMap].delete(k);
    const i = this[kKeyOrder].indexOf(orgKey);
    if (i >= 0)
      this[kKeyOrder].splice(i, 1);
    return super.delete(orgKey);
  }

  sort(compareFn?: (a: K, b: K) => number): this {
    this[kKeyOrder].sort(compareFn);
    return this;
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  protected _getOriginalKey(key: K): K {
    if (this[kOptions].caseSensitive)
      return key;
    if (typeof key === 'string')
      return this[kKeyMap].get(key.toLowerCase() as K) ??
          (this[kWellKnownKeys].get(key.toLowerCase()) as K ?? key);
    return key;
  }

  protected _getStoringKey(key: K): K {
    if (this[kOptions].caseSensitive)
      return key;
    if (typeof key === 'string')
      return key.toLowerCase() as K;
    return key;
  }
}
