import { InjectionToken, NgModule, Type } from '@angular/core';
import { OpraHttpClientOptions } from '@opra/client';

export type OpraClientModuleOptions = OpraHttpClientOptions & {
  serviceUrl: string;
  token?: string | InjectionToken<any>;
}

export interface OpraModuleOptionsFactory {
  createOptions(): Promise<OpraClientModuleOptions> | OpraClientModuleOptions;
}

export interface OpraClientModuleAsyncOptions
    extends Pick<NgModule, 'imports' | 'providers'> {
  token?: string | InjectionToken<any>;
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<any>;
  useFactory?: (...args: any[]) => Promise<OpraClientModuleOptions> | OpraClientModuleOptions;
  deps?: any[];
}

