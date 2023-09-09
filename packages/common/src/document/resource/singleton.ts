import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { SingletonDecorator } from '../decorators/singleton.decorator.js';
import type { Resource } from './resource.js';
import { SingletonClass } from './singleton-class.js';

export interface SingletonConstructor extends SingletonDecorator {
  prototype: SingletonClass;

  new(document: ApiDocument, init: Singleton.InitArguments): SingletonClass;
}

export interface Singleton extends SingletonClass {
}

/**
 * @class Singleton
 * @decorator Singleton
 */
export const Singleton = function (this: SingletonClass | void, ...args: any[]) {
  // Decorator
  if (!this) {
    const [type, options] = args;
    return Singleton[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Singleton.InitArguments];
  merge(this, new SingletonClass(document, init), {descriptor: true});
} as SingletonConstructor;

Singleton.prototype = SingletonClass.prototype;
Object.assign(Singleton, SingletonDecorator);
Singleton[DECORATOR] = SingletonDecorator;


/**
 * @namespace Singleton
 */
export namespace Singleton {
  export interface InitArguments extends StrictOmit<Resource.InitArguments, 'operations'>,
      StrictOmit<OpraSchema.Singleton, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends StrictOmit<Resource.Metadata, 'kind' | 'operations'>, StrictOmit<OpraSchema.Singleton, 'type'> {
    type: TypeThunkAsync | string;
  }

  // Need for augmentation
  export namespace Create {
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Update {
  }

}

