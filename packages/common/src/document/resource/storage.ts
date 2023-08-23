import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { StorageDecorator } from '../decorators/storage.decorator.js';
import type { Resource } from './resource.js';
import { StorageClass } from './storage-class.js'

export interface StorageConstructor extends StorageDecorator {
  prototype: StorageClass;

  new(document: ApiDocument, init: Storage.InitArguments): StorageClass;
}

export interface Storage extends StorageClass {
}

/**
 * @class Storage
 * @decorator Storage
 */
export const Storage = function (this: Storage | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [options] = args;
    return Storage[DECORATOR].call(undefined, options);
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Storage.InitArguments];
  merge(this, new StorageClass(document, init), {descriptor: true});
} as StorageConstructor;

Storage.prototype = StorageClass.prototype;
Object.assign(Storage, StorageDecorator);
Storage[DECORATOR] = StorageDecorator;


export namespace Storage {
  export interface InitArguments extends Resource.InitArguments,
      StrictOmit<OpraSchema.Storage, 'kind'> {
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends StrictOmit<Resource.Metadata, 'kind'>, OpraSchema.Storage {
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

  export type DeleteEndpointOptions = OpraSchema.Storage.DeleteEndpoint;
  export type GetEndpointOptions = OpraSchema.Storage.GetEndpoint;
  export type PostEndpointOptions = OpraSchema.Storage.PostEndpoint;
}
