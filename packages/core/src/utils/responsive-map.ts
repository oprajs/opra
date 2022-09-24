export class ResponsiveMap<K, V> extends Map<K, V> {
  private _keyMap = new Map<K, K>();

  constructor(data?: any) {
    super();
    if (data instanceof Map) {
      data.forEach((v, k) => this.set(k, v));
    } else if (data && typeof data === 'object')
      Object.keys(data).forEach(k => this.set(k as K, data[k]));
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
    return super.set(key, value);
  }

  keys(): IterableIterator<K> {
    return this._keyMap.values();
  }

  delete(key: K): boolean {
    const k = this._getLowerKey(key);
    this._keyMap.delete(k);
    return super.delete(this._getOriginalKey(key));
  }

  protected _getOriginalKey(key: K): K {
    if (typeof key === 'string')
      return this._keyMap.get(key.toLowerCase() as K) ?? key;
    return key;
  }

  protected _getLowerKey(key: K): K {
    if (typeof key === 'string')
      return key.toLowerCase() as K;
    return key;
  }
}
