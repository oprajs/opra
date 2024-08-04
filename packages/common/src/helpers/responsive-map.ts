import { StrictOmit } from 'ts-gems';

export interface ResponsiveMapOptions {
  wellKnownKeys?: string[];
  caseSensitive?: boolean;
}

export type ResponsiveMapInit<V> = ResponsiveMap<V> | Map<string, V> | Record<any, V>;

function isMap(v): v is Map<any, any> {
  return v && typeof v.forEach === 'function';
}

const kEntries = Symbol.for('kEntries');
const kKeyMap = Symbol.for('kKeyMap');
const kWellKnownKeys = Symbol.for('kWellKnownKeys');
const kOptions = Symbol.for('kOptions');
const kSize = Symbol.for('kSize');

/**
 * A Map implementation that supports case-insensitivity and ordered keys
 */
export class ResponsiveMap<V> implements Map<string, V> {
  private declare [kSize]: number;
  private declare [kEntries]: Record<string, V>;
  private declare [kKeyMap]: Record<string, string>;
  private declare [kWellKnownKeys]: Record<string, string>;
  private declare [kOptions]: StrictOmit<ResponsiveMapOptions, 'wellKnownKeys'>;

  constructor(init?: ResponsiveMapInit<V> | null, options?: ResponsiveMapOptions) {
    Object.defineProperty(this, kSize, {
      value: 0,
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(this, kEntries, {
      value: {},
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(this, kKeyMap, {
      value: {},
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(this, kWellKnownKeys, {
      value: {},
      enumerable: false,
      writable: true,
    });
    const caseSensitive = !!options?.caseSensitive;
    Object.defineProperty(this, kOptions, {
      value: {
        caseSensitive,
      },
      enumerable: false,
    });
    if (options?.wellKnownKeys) {
      options.wellKnownKeys.forEach(k => {
        if (caseSensitive) this[kWellKnownKeys][k] = k;
        else this[kWellKnownKeys][k.toLowerCase()] = k;
      });
    }
    this.clear();
    if (init) this.setAll(init);
  }

  get size(): number {
    return this[kSize];
  }

  clear() {
    Object.keys(this[kEntries]).forEach(k => delete this[kEntries][k]);
    Object.keys(this[kKeyMap]).forEach(k => delete this[kKeyMap][k]);
    this[kSize] = 0;
  }

  forEach(callbackfn: (value: V, key: string, map: Map<string, V>) => void, thisArg?: any): void {
    for (const [k, v] of this.entries()) {
      callbackfn.call(thisArg, v, k, this);
    }
  }

  get(key: string): V | undefined {
    if (!key) return;
    return this[kEntries][this._getStoringKey(key)];
  }

  has(key: string): boolean {
    if (!key) return false;
    return Object.prototype.hasOwnProperty.call(this[kEntries], this._getStoringKey(key));
  }

  set(key: string, value: V): this {
    const storeKey = this._getStoringKey(key);
    key = this._getOriginalKey(key);
    const exists = Object.prototype.hasOwnProperty.call(this[kEntries], storeKey);
    this[kEntries][storeKey] = value;
    if (!exists) this[kSize]++;
    this[kKeyMap][storeKey] = key;
    return this;
  }

  setAll(source: ResponsiveMapInit<V>): this {
    if (isMap(source)) source.forEach((v, k) => this.set(k, v));
    else Object.keys(source).forEach(k => this.set(k, source[k]));
    return this;
  }

  keys(): IterableIterator<string> {
    return Object.values(this[kKeyMap])[Symbol.iterator]();
  }

  values(): IterableIterator<V> {
    return Object.values(this[kEntries])[Symbol.iterator]();
  }

  entries(): IterableIterator<[string, V]> {
    return Object.entries(this[kEntries])[Symbol.iterator]();
  }

  delete(key: string): boolean {
    const storeKey = this._getStoringKey(key);
    const exists = Object.prototype.hasOwnProperty.call(this[kEntries], storeKey);
    delete this[kEntries][storeKey];
    delete this[kKeyMap][storeKey];
    if (!exists) this[kSize]--;
    return exists;
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    const oldValues = { ...this[kEntries] };
    const oldKeymap = { ...this[kKeyMap] };
    const keys = Array.from(this.keys());
    if (compareFn) keys.sort(compareFn);
    else keys.sort();
    this.clear();
    for (const k of keys) {
      this[kEntries][k] = oldValues[k];
      this[kKeyMap][k] = oldKeymap[k];
    }
    this[kSize] = keys.length;
    return this;
  }

  toObject(): Record<string, V> {
    const out: any = {};
    for (const [storeKey, orgKey] of Object.entries(this[kKeyMap])) {
      out[orgKey] = this[kEntries][storeKey];
    }
    return out;
  }

  [Symbol.iterator](): IterableIterator<[string, V]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return '[Object ResponsiveMap]';
  }

  protected _getOriginalKey(key: string): string {
    if (!key || this[kOptions].caseSensitive) return key;
    const storeKey = this._getStoringKey(key);
    return this[kKeyMap][storeKey] ?? this[kWellKnownKeys][storeKey] ?? key;
  }

  protected _getStoringKey(key: string): string {
    if (this[kOptions].caseSensitive) return key;
    return key.toLowerCase() as string;
  }
}
