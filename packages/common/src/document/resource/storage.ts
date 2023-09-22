import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { Resource } from './resource.js';
import { StorageClass } from './storage-class.js'
import { StorageDecorator } from './storage-decorator.js';

export interface Storage extends StorageClass {
}

export interface StorageConstructor extends StorageDecorator {
  prototype: StorageClass;

  new(document: ApiDocument, init: Storage.InitArguments): StorageClass;
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

  export interface InitArguments extends StrictOmit<Combine<Resource.InitArguments, StorageDecorator.Metadata>, 'kind'> {
  }

  export interface DecoratorOptions extends Partial<StrictOmit<StorageDecorator.Metadata, 'kind' | 'operations' | 'actions'>> {
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

}
