import { ModuleMetadata, Type } from '@nestjs/common';
import { OpraSchema } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';

export type OpraModuleOptions = NodeHttpAdapter.Options & {
  id?: any;
  info?: OpraSchema.DocumentInfo,

  /**
   * @default true
   */
  useGlobalPrefix?: boolean;

}

type OpraModuleOptionsWithoutId = Omit<OpraModuleOptions, 'id'>;

export interface OpraModuleOptionsFactory {
  createOptions(): Promise<OpraModuleOptionsWithoutId> | OpraModuleOptionsWithoutId;
}

export interface OpraModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  id?: any;
  useExisting?: Type<OpraModuleOptionsFactory>;
  useClass?: Type<OpraModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OpraModuleOptionsWithoutId> | OpraModuleOptionsWithoutId;
  inject?: any[];
}

