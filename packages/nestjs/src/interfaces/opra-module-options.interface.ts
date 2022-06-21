import {ModuleMetadata, Type} from '@nestjs/common';
import {FallbackLng, LanguageResource} from '@opra/i18n';

export type Enhancer = 'guards' | 'interceptors' | 'filters';

export interface OpraModuleOptions {
  /**
   * @default true
   */
  useGlobalPrefix?: boolean;
  prefix: string;
  name: string;
  description?: string;
  i18n?: I18nInitOptions;

  context?: object | ((request: any, platformName: string) => object | Promise<object>);
}

export interface I18nInitOptions {
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


export interface OpraModuleOptionsFactory {
  createOptions(): Promise<OpraModuleOptions> | OpraModuleOptions;
}

export interface OpraModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<OpraModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OpraModuleOptions> | OpraModuleOptions;
  inject?: any[];
}

