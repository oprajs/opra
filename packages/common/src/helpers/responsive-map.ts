export class ResponsiveMap<K, V> extends Map<K, V> {
  private _keyMap = new Map<K, K>();
  private _keyOrder: K[] = [];
  private _wellKnownKeyMap = new Map<string, string>();

  constructor(data?: any, wellKnownKeys?: string[]) {
    super();
    if (wellKnownKeys)
      wellKnownKeys.forEach(k => this._wellKnownKeyMap.set(k.toLowerCase(), k));
    if (typeof data?.forEach === 'function') {
      data.forEach((v, k) => this.set(k, v));
    } else if (data && typeof data === 'object')
      Object.keys(data).forEach(k => this.set(k as K, data[k]));
  }

  clear() {
    super.clear();
    this._keyMap.clear();
    this._keyOrder = [];
  }

  get(key: K): V | undefined {
    const orgKey = this._getOriginalKey(key);
    return super.get(orgKey as K);
  }

  has(key: K): boolean {
    return this._keyMap.has(this._getLowerKey(key));
  }

  set(key: K, value: V): this {
    key = this._getOriginalKey(key);
    this._keyMap.set(this._getLowerKey(key), key);
    if (!this._keyOrder.includes(key))
      this._keyOrder.push(key);
    return super.set(key, value);
  }

  keys(): IterableIterator<K> {
    return this._keyOrder.values();
  }

  values(): IterableIterator<V> {
    let i = -1;
    const arr = this._keyOrder;
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
    const arr = this._keyOrder;
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
    const k = this._getLowerKey(key);
    this._keyMap.delete(k);
    const i = this._keyOrder.indexOf(orgKey);
    if (i >= 0)
      this._keyOrder.splice(i, 1);
    return super.delete(orgKey);
  }

  sort(compareFn?: (a: K, b: K) => number): this {
    this._keyOrder.sort(compareFn);
    return this;
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  protected _getOriginalKey(key: K): K {
    if (typeof key === 'string')
      return this._keyMap.get(key.toLowerCase() as K) ??
          (this._wellKnownKeyMap.get(key.toLowerCase()) as K ?? key);
    return key;
  }

  protected _getLowerKey(key: K): K {
    if (typeof key === 'string')
      return key.toLowerCase() as K;
    return key;
  }
}
