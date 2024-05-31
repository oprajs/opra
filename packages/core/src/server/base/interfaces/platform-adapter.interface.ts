import type { ApiDocument, FallbackLng, I18n, LanguageResource, OpraSchema } from '@opra/common';
import type { ILogger } from './logger.interface';

export interface PlatformAdapter {
  readonly document: ApiDocument;
  readonly protocol: OpraSchema.Protocol;
  readonly platform: string;

  /**
   * Calls shutDown hook for all resources
   */
  close(): Promise<void>;
}

/**
 * @namespace PlatformAdapter
 */
export namespace PlatformAdapter {
  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    logger?: ILogger;
  }

  export interface I18nOptions {
    /**
     * Language to use
     * @default undefined
     */
    lng?: string;

    /**
     * Language to use if translations in user language are not available.
     * @default 'dev'
     */
    fallbackLng?: false | FallbackLng;

    /**
     * Default namespace used if not passed to translation function
     * @default 'translation'
     */
    defaultNS?: string;

    /**
     * Resources to initialize with
     * @default undefined
     */
    resources?: LanguageResource;

    /**
     * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
     * @default undefined
     */
    resourceDirs?: string[];
  }
}
