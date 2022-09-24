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
    const k = this._wrapKey(key);
    return super.get(k);
  }

  has(key: K): boolean {
    const k = this._wrapKey(key);
    return super.has(k);
  }

  set(key: K, value: V): this {
    const k = this._wrapKey(key);
    this._keyMap.set(k, key);
    return super.set(key, value);
  }

  keys(): IterableIterator<K> {
    return this._keyMap.values();
  }

  delete(key: K): boolean {
    const k = this._wrapKey(key);
    this._keyMap.delete(k);
    return super.delete(key);
  }

  protected _wrapKey(key: K): K {
    if (typeof key === 'string')
      return key.toLowerCase() as K;
    return key;
  }
}
