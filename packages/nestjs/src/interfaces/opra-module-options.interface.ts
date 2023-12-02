import { ModuleMetadata, Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { ExpressAdapter, NodeHttpAdapter } from '@opra/core';

export type OpraModuleOptions = NodeHttpAdapter.Options & {
  id?: any;
  adapterNode?: ExpressAdapter.Options;
  adapterExpress?: ExpressAdapter.Options;
  document?: Partial<ApiDocumentFactory.InitArguments>

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

