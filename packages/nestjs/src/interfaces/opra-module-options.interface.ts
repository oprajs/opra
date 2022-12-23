import { ModuleMetadata, Type } from '@nestjs/common';
import { OpraSchema } from '@opra/common';
import { OpraHttpAdapter } from '@opra/core';

export type OpraModuleOptions = OpraHttpAdapter.Options & {
  info?: OpraSchema.DocumentInfo,

  /**
   * @default true
   */
  useGlobalPrefix?: boolean;

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

