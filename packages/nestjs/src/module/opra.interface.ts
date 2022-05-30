import * as I18next from 'i18next';
import i18next, {FallbackLng} from 'i18next';
import {Type} from '@nestjs/common';
import {ModuleMetadata} from '@nestjs/common/interfaces';

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

export type I18n = Type<I18next.i18n>;
export const I18n = Object.getPrototypeOf(i18next).constructor as I18n;
export type I18nResource = I18next.Resource;

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
  resources?: I18nResource;

  /**
   * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
   * @default undefined
   */
  resourceDirs?: string[];
}


export interface OpraModuleOptions {
  servicePrefix?: string;
  i18n?: I18nInitOptions;
}

export interface OpraServiceConfig {
  path?: string;
  module: Type;
}
