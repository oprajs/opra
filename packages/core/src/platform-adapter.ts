import './augmentation/18n.augmentation.js';
import { AsyncEventEmitter } from 'strict-typed-events';
import { ApiDocument, I18n, OpraSchema } from '@opra/common';
import { kAssetCache } from './constants.js';
import { Logger } from './helpers/logger.js';
import { AssetCache } from './http/impl/asset-cache.js';
import type { ILogger } from './interfaces/logger.interface';

/**
 * @namespace PlatformAdapter
 */
export namespace PlatformAdapter {
  export interface Options {
    i18n?: I18n;
    logger?: ILogger;
  }
}

/**
 * @class PlatformAdapter
 */
export abstract class PlatformAdapter extends AsyncEventEmitter {
  protected [kAssetCache]: AssetCache;
  readonly document: ApiDocument;
  abstract readonly protocol: OpraSchema.Protocol;
  logger: Logger;
  i18n: I18n;

  protected constructor(document: ApiDocument, options?: PlatformAdapter.Options) {
    super();
    this[kAssetCache] = new AssetCache();
    this.document = document;
    this.logger =
      options?.logger && options.logger instanceof Logger ? options.logger : new Logger({ instance: options?.logger });
    this.i18n = options?.i18n || I18n.defaultInstance;
  }

  abstract close(): Promise<void>;
}
