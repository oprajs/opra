import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from '../data-type/complex-type.js';
import { CollectionClass } from './collection-class.js';
import { CollectionDecorator } from './collection-decorator.js';
import { Source } from './source.js';


export namespace Collection {
  export interface InitArguments extends Source.InitArguments,
      StrictOmit<OpraSchema.Collection, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions<T = any> extends Source.DecoratorOptions {
    primaryKey?: keyof T | (keyof T)[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.Collection, 'type'> {
    name: string;
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

export interface CollectionConstructor extends CollectionDecorator {
  prototype: Collection;

  new(document: ApiDocument, init: Collection.InitArguments): Collection;
}

export interface Collection extends CollectionClass {
}

/**
 *
 */
export const Collection = function (this: Collection | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args;
    return CollectionDecorator.call(undefined, type, options);
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Collection.InitArguments];
  merge(this, new CollectionClass(document, init), {descriptor: true});

} as CollectionConstructor;

Collection.prototype = CollectionClass.prototype;

Object.assign(Collection, CollectionDecorator);
