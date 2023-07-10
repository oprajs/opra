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
      Pick<OpraSchema.Storage, 'operations'> {
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends OpraSchema.Storage {
    name: string;
  }

  interface Operation {
    handlerName?: string;
  }

  export interface Operations {
    delete?: OpraSchema.Storage.DeleteOperation & Operation;
    get?: OpraSchema.Storage.GetOperation & Operation;
    put?: OpraSchema.Storage.PutOperation & Operation;
  }

  export type DeleteOperationOptions = StrictOmit<OpraSchema.Storage.DeleteOperation, 'handler'>;
  export type GetOperationOptions = StrictOmit<OpraSchema.Storage.GetOperation, 'handler'>;
  export type PutOperationOptions = StrictOmit<OpraSchema.Storage.PutOperation, 'handler'>;
}

class StorageClass extends Resource {
  readonly kind = OpraSchema.Storage.Kind;
  readonly operations: Storage.Operations;
  readonly controller?: object | Type;

  constructor(
      document: ApiDocument,
      init: Storage.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    const operations = this.operations = init.operations || {};
    if (this.controller) {
      const instance = typeof this.controller == 'function'
          ? new (this.controller as Type)()
          : this.controller;
      for (const operation of Object.values(operations)) {
        if (!operation.handler && operation.handlerName) {
          const fn = instance[operation.handlerName];
          if (!fn)
            throw new TypeError(`No such operation handler (${operation.handlerName}) found`);
          operation.handler = fn.bind(instance);
        }
      }
    }
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

  Delete: (options?: Storage.DeleteOperationOptions) => PropertyDecorator;
  Get: (options?: Storage.GetOperationOptions) => PropertyDecorator;
  Put: (options?: Storage.PutOperationOptions) => PropertyDecorator;
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
        const metadata = {
          ...options,
          handlerName: propertyKey
        };

        const resourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Storage.Metadata;
        resourceMetadata.operations = resourceMetadata.operations || {};
        resourceMetadata.operations[operation] = metadata;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}

Storage.Delete = createOperationDecorator('delete');
Storage.Get = createOperationDecorator('get');
Storage.Put = createOperationDecorator('put');
