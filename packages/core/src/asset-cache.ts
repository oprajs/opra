export class AssetCache {
  protected _items = new WeakMap<any, Record<string, any>>();

  get<T>(obj: any, name: string): T | undefined {
    const cache = this._items.get(obj);
    return cache && (cache[name] as T);
  }

  set(obj: any, name: string, asset: any): void {
    let cache = this._items.get(obj);
    if (!cache) {
      cache = {};
      this._items.set(obj, cache);
    }
    cache[name] = asset;
  }
}
