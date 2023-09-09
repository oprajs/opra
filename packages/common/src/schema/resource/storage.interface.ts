import type { Endpoint } from './endpoint.interface.js';
import type { ResourceBase } from './resource.interface.js';

export interface Storage extends ResourceBase<Storage.Kind, Storage.Operations> {
}

export namespace Storage {
  export const Kind = 'Storage';
  export type Kind = 'Storage';

  export interface Operations {
    delete?: Operations.Delete;
    get?: Operations.Get;
    post?: Operations.Post;
  }

  export namespace Operations {
    export type Delete = Endpoint;
    export type Get = Endpoint;
    export type Post = Endpoint & {

      /**
       * the minium size of uploaded file
       *
       * @default 1
       */
      minFileSize?: number | undefined;

      /**
       * limit the amount of uploaded files, set Infinity for unlimited
       *
       * @default Infinity
       */
      maxFiles?: number;

      /**
       * limit the size of uploaded file
       *
       * @default 200 * 1024 * 1024
       */
      maxFileSize?: number | undefined;

      /**
       * limit the size of the batch of uploaded files
       *
       * @default maxFileSize
       */
      maxTotalFileSize?: number | undefined;

      /**
       * limit the number of fields, set 0 for unlimited
       *
       * @default 1000
       */
      maxFields?: number | undefined;

      /**
       * limit the amount of memory all fields together (except files) can allocate in bytes
       *
       * @default 20 * 1024 * 1024
       */
      maxFieldsSize?: number | undefined;
    };
  }

}
