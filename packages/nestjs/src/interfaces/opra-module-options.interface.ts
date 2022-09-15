import { ModuleMetadata, Type } from '@nestjs/common';
import { OpraHttpAdapter } from '@opra/core';
import { OpraSchema } from '@opra/schema';

export type OpraModuleOptions = OpraHttpAdapter.Options & {
  /**
   * @default true
   */
  useGlobalPrefix?: boolean;

  info?: OpraSchema.DocumentInfo,
}


export interface OpraModuleOptionsFactory {
  createOptions(): Promise<OpraModuleOptions> | OpraModuleOptions;
}

export interface OpraModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<OpraModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OpraModuleOptions> | OpraModuleOptions;
  inject?: any[];
}

