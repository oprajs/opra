/**
 * AssetCache is a utility class for caching assets associated with objects.
 * It uses a WeakMap to store assets, ensuring that they are garbage collected
 * when the objects themselves are no longer referenced.
 */
export class AssetCache {
  protected _items = new WeakMap<any, Record<string, any>>();

  /**
   * Retrieves an asset from the cache for a given object and asset name.
   *
   * @param obj - The object associated with the asset.
   * @param name - The name of the asset.
   * @returns The cached asset, or undefined if not found.
   */
  get<T>(obj: any, name: string): T | undefined {
    const cache = this._items.get(obj);
    return cache && (cache[name] as T);
  }

  /**
   * Stores an asset in the cache for a given object and asset name.
   *
   * @param obj - The object to associate with the asset.
   * @param name - The name of the asset.
   * @param asset - The asset to be cached.
   */
  set(obj: any, name: string, asset: any): void {
    let cache = this._items.get(obj);
    if (!cache) {
      cache = {};
      this._items.set(obj, cache);
    }
    cache[name] = asset;
  }

  /**
   * Removes an asset from the cache for a given object and asset name.
   *
   * @param obj - The object associated with the asset.
   * @param name - The name of the asset to be removed.
   */
  delete(obj: any, name: string): void {
    const cache = this._items.get(obj);
    if (!cache) return;
    delete cache[name];
  }
}
