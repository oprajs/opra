import './augmentation/18n.augmentation.js';
import { ApiDocument, I18n, OpraSchema } from '@opra/common';
import { AsyncEventEmitter, EventMap } from 'node-events-async';
import { AssetCache } from './asset-cache.js';
import { kAssetCache } from './constants.js';
import { ExecutionContext } from './execution-context.js';
import { ILogger } from './interfaces/logger.interface.js';

/**
 * Base class for all platform adapters in the OPRA framework.
 * A platform adapter bridge between a specific platform (like Express, Socket.io, etc.)
 * and the OPRA application logic.
 *
 * @typeParam T - The event map type for the adapter.
 */
export abstract class PlatformAdapter<
  T extends EventMap<T> = never,
> extends AsyncEventEmitter<T> {
  protected [kAssetCache]: AssetCache;
  declare protected _document: ApiDocument;
  /** The transport protocol supported by this adapter */
  abstract readonly transform: OpraSchema.Transport;
  /** The platform name of this adapter */
  abstract readonly platform: string;
  /** Internationalization service instance */
  i18n: I18n;
  /** Logger instance for the adapter */
  logger?: ILogger;

  /**
   * Initializes the platform adapter.
   *
   * @param options - Configuration options for the adapter.
   */
  protected constructor(options?: PlatformAdapter.Options) {
    super();
    this[kAssetCache] = new AssetCache();
    this.i18n = options?.i18n || I18n.defaultInstance;
    this.logger = options?.logger;
  }

  /**
   * Returns the API document associated with this adapter.
   */
  get document(): ApiDocument {
    return this._document;
  }

  /**
   * Closes the adapter and releases any resources.
   *
   * @returns A promise that resolves when the adapter is closed.
   */
  abstract close(): Promise<void>;

  /**
   * Creates a root execution context for the adapter.
   *
   * @returns A new {@link ExecutionContext} instance.
   */
  createRootContext(): ExecutionContext {
    return new ExecutionContext({
      __adapter: this,
      __docNode: this.document.node,
      transport: this.transform,
      platform: this.platform,
    });
  }
}

/**
 * Namespace for {@link PlatformAdapter} related types and interfaces.
 */
export namespace PlatformAdapter {
  /**
   * Configuration options for {@link PlatformAdapter}.
   */
  export interface Options {
    /** The internationalization instance to use */
    i18n?: I18n;
    /** The logger instance to use */
    logger?: ILogger;
  }
}
