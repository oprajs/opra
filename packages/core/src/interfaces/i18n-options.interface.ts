import { FallbackLng, LanguageResource } from '@opra/common';

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
