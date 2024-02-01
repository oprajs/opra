import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { ApiResource } from './api-resource.js';
import { CollectionClass } from './collection-class.js';
import { CollectionDecorator } from './collection-decorator.js';
import type { Container } from './container.js';

export interface Collection extends CollectionClass {
}

export interface CollectionConstructor extends CollectionDecorator {
  prototype: CollectionClass;

  new(parent: ApiDocument | Container, init: Collection.InitArguments): CollectionClass;
}

/**
 * @class Collection
 * @decorator Collection
 */
export const Collection = function (this: CollectionClass | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args;
    return Collection[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [parent, init] = args as [ApiDocument | Container, Collection.InitArguments];
  merge(this, new CollectionClass(parent, init), {descriptor: true});
} as CollectionConstructor;

Collection.prototype = CollectionClass.prototype;
Object.assign(Collection, CollectionDecorator);
Collection[DECORATOR] = CollectionDecorator;


/**
 * @namespace Collection
 */
export namespace Collection {

  export interface InitArguments extends StrictOmit<
      Combine<ApiResource.InitArguments, CollectionDecorator.Metadata>, 'kind' | 'type'> {
    name: string;
    type: ComplexType;
  }

  export interface DecoratorOptions<T = any> extends Partial<
      StrictOmit<CollectionDecorator.Metadata, 'kind' | 'operations' | 'actions' | 'primaryKey'>
  > {
    primaryKey?: keyof T | (keyof T)[];
  }

  /* Required for augmentation */
  export interface Action {
  }

  /* Required for augmentation */
  export namespace Action {
  }

  /* Required for augmentation */
  export interface Create {
  }

  /* Required for augmentation */
  export namespace Create {
  }

  /* Required for augmentation */
  export interface Delete {
  }

  /* Required for augmentation */
  export namespace Delete {
  }

  /* Required for augmentation */
  export interface DeleteMany {
  }

  /* Required for augmentation */
  export namespace DeleteMany {
  }

  /* Required for augmentation */
  export interface FindMany {
  }

  /* Required for augmentation */
  export namespace FindMany {
  }

  /* Required for augmentation */
  export interface Get {
  }

  /* Required for augmentation */
  export namespace Get {
  }

  /* Required for augmentation */
  export interface Update {
  }

  /* Required for augmentation */
  export namespace Update {
  }

  /* Required for augmentation */
  export interface UpdateMany {
  }

  /* Required for augmentation */
  export namespace UpdateMany {
  }

}


