import type { StrictOmit } from 'ts-gems';
import { InjectionToken, NgModule, Type } from '@angular/core';
import { AngularBackend } from '../angular-backend.js';

export type OpraClientModuleOptions = AngularBackend.Options & {
  serviceUrl: string;
  token?: string | InjectionToken<any>;
};

type _OpraClientModuleOptions = StrictOmit<OpraClientModuleOptions, 'token'>;

export interface OpraModuleOptionsFactory {
  createOptions(): Promise<_OpraClientModuleOptions> | _OpraClientModuleOptions;
}

export interface OpraClientModuleAsyncOptions extends Pick<NgModule, 'imports' | 'providers'> {
  token?: string | InjectionToken<any>;
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<any>;
  useFactory?: (...args: any[]) => Promise<_OpraClientModuleOptions> | _OpraClientModuleOptions;
  deps?: any[];
}
