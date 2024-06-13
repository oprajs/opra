// import { ApiDocumentFactory } from '@opra/common';
// import { ExpressAdapter, HttpAdapter } from '@opra/core';

// export interface OpraModuleOptions extends HttpAdapter.Options {
//   id?: any;
//   document?: Partial<ApiDocumentFactory.InitArguments>;
//
//   /**
//    * @default true
//    */
//   useGlobalPrefix?: boolean;
// }

// export interface ExpressModuleOptions extends OpraModuleOptions, HttpAdapter.Options {}

// type OpraModuleOptionsWithoutId = Omit<OpraModuleOptions, 'id'>;

// export interface OpraModuleOptionsFactory {
//   createOptions(): Promise<OpraModuleOptionsWithoutId> | OpraModuleOptionsWithoutId;
// }
