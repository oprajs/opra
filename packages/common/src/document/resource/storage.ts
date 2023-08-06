import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { Resource } from './resource.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';
const NAME_PATTERN = /^(.*)(Resource)$/;

export namespace Storage {
  export interface InitArguments extends Resource.InitArguments,
      StrictOmit<OpraSchema.Storage, 'kind'> {
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends OpraSchema.Storage {
    name: string;
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Post {
  }

  export type DeleteOperationOptions = OpraSchema.Storage.DeleteOperation;
  export type GetOperationOptions = OpraSchema.Storage.GetOperation;
  export type PostOperationOptions = OpraSchema.Storage.PostOperation;
}

class StorageClass extends Resource {
  readonly kind = OpraSchema.Storage.Kind;
  readonly operations: OpraSchema.Storage.Operations;
  readonly controller?: object | Type;

  constructor(
      document: ApiDocument,
      init: Storage.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    this.operations = {...init.operations};
  }

  exportSchema(): OpraSchema.Storage {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Storage;
    Object.assign(out, omitUndefined({
      operations: this.operations
    }));
    return out;
  }

}

export interface StorageConstructor {
  prototype: Storage;

  new(document: ApiDocument, init: Storage.InitArguments): Storage;

  (options?: Storage.DecoratorOptions): ClassDecorator;

  Delete: (options?: Storage.DeleteOperationOptions) => ((target: Object, propertyKey: 'delete') => void);
  Get: (options?: Storage.GetOperationOptions) => ((target: Object, propertyKey: 'get') => void);
  Post: (options?: Storage.PostOperationOptions) => ((target: Object, propertyKey: 'post') => void);
}

export interface Storage extends StorageClass {
}

export const Storage = function (this: Storage | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [options] = args as [Storage.DecoratorOptions | undefined];
    return function (target: Function) {
      const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
      const metadata: Storage.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
      metadata.kind = OpraSchema.Storage.Kind;
      metadata.name = name;
      // Merge with previous metadata object
      const m = Reflect.getMetadata(METADATA_KEY, target);
      if (m && metadata !== m)
        Object.assign(metadata, omit(m), Object.keys(metadata));
      // Merge options
      if (options)
        Object.assign(metadata, omit(options, ['kind', 'name', 'type', 'controller']));
      Reflect.defineMetadata(METADATA_KEY, metadata, target);

      /* Define Injectable metadata for NestJS support*/
      Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
    }
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Storage.InitArguments];
  merge(this, new StorageClass(document, init), {descriptor: true});
} as StorageConstructor;

Storage.prototype = StorageClass.prototype;

function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        if (propertyKey !== operation)
          throw new TypeError(`Name of the handler name should be '${operation}'`);
        const operationMeta = {...options};
        const resourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Storage.Metadata;
        resourceMetadata.operations = resourceMetadata.operations || {};
        resourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}

Storage.Delete = createOperationDecorator('delete');
Storage.Get = createOperationDecorator('get');
Storage.Post = createOperationDecorator('post');
