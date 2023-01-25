import { InjectionToken, NgModule, Type } from '@angular/core';
import { OpraHttpClientOptions } from '@opra/client';

export type OpraClientModuleOptions = OpraHttpClientOptions & {
  serviceUrl: string;
  clientToken?: string | InjectionToken<any>;
  serviceToken?: string | InjectionToken<any>;
  serviceClass?: Type<any>;
}

type _OpraClientModuleOptions = Omit<OpraClientModuleOptions, 'clientToken' | 'serviceToken' | 'serviceClass'>;

export interface OpraModuleOptionsFactory {
  createOptions(): Promise<_OpraClientModuleOptions> | _OpraClientModuleOptions;
}

export interface OpraClientModuleAsyncOptions
    extends Pick<NgModule, 'imports' | 'providers'> {
  clientToken?: string | InjectionToken<any>;
  serviceToken?: string | InjectionToken<any>;
  serviceClass?: Type<any>;
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<any>;
  useFactory?: (...args: any[]) => Promise<_OpraClientModuleOptions> | _OpraClientModuleOptions;
  deps?: any[];
}

