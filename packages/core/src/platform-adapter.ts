import './augmentation/18n.augmentation.js';
import { ApiDocument, I18n, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';
import { AssetCache } from './asset-cache.js';
import { kAssetCache } from './constants.js';

/**
 * @namespace PlatformAdapter
 */
export namespace PlatformAdapter {
  export interface Options {
    i18n?: I18n;
  }
}

/**
 * @class PlatformAdapter
 */
export abstract class PlatformAdapter extends AsyncEventEmitter {
  protected [kAssetCache]: AssetCache;
  readonly document: ApiDocument;
  abstract readonly protocol: OpraSchema.Transport;
  i18n: I18n;

  protected constructor(document: ApiDocument, options?: PlatformAdapter.Options) {
    super();
    this[kAssetCache] = new AssetCache();
    this.document = document;
    this.i18n = options?.i18n || I18n.defaultInstance;
  }

  abstract close(): Promise<void>;
}
