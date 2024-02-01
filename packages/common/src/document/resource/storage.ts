import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import type { ApiResource } from './api-resource';
import type { Container } from './container.js';
import { StorageClass } from './storage-class.js'
import { StorageDecorator } from './storage-decorator.js';

export interface Storage extends StorageClass {
}

export interface StorageConstructor extends StorageDecorator {
  prototype: StorageClass;

  new(parent: ApiDocument | Container, init: Storage.InitArguments): StorageClass;
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
  const [parent, init] = args as [ApiDocument | Container, Storage.InitArguments];
  merge(this, new StorageClass(parent, init), {descriptor: true});
} as StorageConstructor;

Storage.prototype = StorageClass.prototype;
Object.assign(Storage, StorageDecorator);
Storage[DECORATOR] = StorageDecorator;


export namespace Storage {

  export interface InitArguments extends StrictOmit<Combine<ApiResource.InitArguments, StorageDecorator.Metadata>, 'kind'> {
  }

  export interface DecoratorOptions extends Partial<StrictOmit<StorageDecorator.Metadata, 'kind' | 'operations' | 'actions'>> {
  }

  /* Required for augmentation */
  export interface Action {
  }

  /* Required for augmentation */
  export namespace Action {
  }

  /* Required for augmentation */
  export interface Delete {
  }

  /* Required for augmentation */
  export namespace Delete {
  }

  /* Required for augmentation */
  export interface Get {
  }

  /* Required for augmentation */
  export namespace Get {
  }

  /* Required for augmentation */
  export interface Post {
  }

  /* Required for augmentation */
  export namespace Post {
  }

}
