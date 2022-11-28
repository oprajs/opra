import { NgModule, Type } from '@angular/core';
import { OpraClientOptions } from '@opra/client';

export type OpraClientModuleOptions = Omit<OpraClientOptions, 'adapter'> & {
  serviceUrl: string;
  name?: string;
}


export interface OpraModuleOptionsFactory {
  createOptions(): Promise<OpraClientModuleOptions> | OpraClientModuleOptions;
}

export interface OpraClientModuleAsyncOptions
    extends Pick<NgModule, 'imports' | 'providers'> {
  name?: string;
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<any>;
  useFactory?: (...args: any[]) => Promise<OpraClientModuleOptions> | OpraClientModuleOptions;
  deps?: any[];
}

