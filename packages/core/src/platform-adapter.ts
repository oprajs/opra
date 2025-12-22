import './augmentation/18n.augmentation.js';
import { ApiDocument, I18n, OpraSchema } from '@opra/common';
import { AsyncEventEmitter, EventMap } from 'node-events-async';
import { AssetCache } from './asset-cache.js';
import { kAssetCache } from './constants.js';
import { ILogger } from './interfaces/logger.interface.js';

/**
 * @class PlatformAdapter
 */
export abstract class PlatformAdapter<
  T extends EventMap<T> = never,
> extends AsyncEventEmitter<T> {
  protected [kAssetCache]: AssetCache;
  declare protected _document: ApiDocument;
  abstract readonly transform: OpraSchema.Transport;
  i18n: I18n;
  logger?: ILogger;

  protected constructor(options?: PlatformAdapter.Options) {
    super();
    this[kAssetCache] = new AssetCache();
    this.i18n = options?.i18n || I18n.defaultInstance;
    this.logger = options?.logger;
  }

  get document(): ApiDocument {
    return this._document;
  }

  abstract close(): Promise<void>;
}

/**
 * @namespace PlatformAdapter
 */
export namespace PlatformAdapter {
  export interface Options {
    i18n?: I18n;
    logger?: ILogger;
  }
}
