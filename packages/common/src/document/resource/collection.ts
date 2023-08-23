import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { CollectionDecorator } from '../decorators/collection-decorator.js';
import { CollectionClass } from './collection-class.js';
import type { Resource } from './resource.js';

export interface CollectionConstructor extends CollectionDecorator {
  prototype: CollectionClass;

  new(document: ApiDocument, init: Collection.InitArguments): CollectionClass;
}

export interface Collection extends CollectionClass {
}

/**
 * @class Collection
 * @decorator Collection
 */
export const Collection = function (this: CollectionClass | void, ...args: any[]) {
  // Decorator
  if (!this) {
    const [type, options] = args;
    return Collection[DECORATOR].call(undefined, type, options);
  }
  // Constructor
  const [document, init] = args as [ApiDocument, Collection.InitArguments];
  merge(this, new CollectionClass(document, init), {descriptor: true});
} as CollectionConstructor;

Collection.prototype = CollectionClass.prototype;
Object.assign(Collection, CollectionDecorator);
Collection[DECORATOR] = CollectionDecorator;


/**
 * @namespace Collection
 */
export namespace Collection {
  export interface InitArguments extends Resource.InitArguments,
      StrictOmit<OpraSchema.Collection, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions<T = any> extends Resource.DecoratorOptions {
    primaryKey?: keyof T | (keyof T)[];
  }

  export interface Metadata extends StrictOmit<Resource.Metadata, 'kind'>, StrictOmit<OpraSchema.Collection, 'type'> {
    type: TypeThunkAsync | string;
  }

  // Need for augmentation
  export namespace Create {
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace DeleteMany {
  }

  // Need for augmentation
  export namespace FindMany {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Update {
  }

  // Need for augmentation
  export namespace UpdateMany {
  }

  export type CreateEndpointOptions = OpraSchema.Collection.CreateEndpoint;
  export type DeleteEndpointOptions = OpraSchema.Collection.DeleteEndpoint;
  export type DeleteManyEndpointOptions = OpraSchema.Collection.DeleteManyEndpoint;
  export type FindManyEndpointOptions = OpraSchema.Collection.FindManyEndpoint;
  export type GetEndpointOptions = OpraSchema.Collection.GetEndpoint;
  export type UpdateEndpointOptions = OpraSchema.Collection.UpdateEndpoint;
  export type UpdateManyEndpointOptions = OpraSchema.Collection.UpdateManyEndpoint;
}


