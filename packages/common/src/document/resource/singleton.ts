import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { Container } from './container.js';
import type { Resource } from './resource.js';
import { SingletonClass } from './singleton-class.js';
import { SingletonDecorator } from './singleton-decorator.js';

export interface Singleton extends SingletonClass {
}

export interface SingletonConstructor extends SingletonDecorator {
  prototype: SingletonClass;

  new(parent: ApiDocument | Container, init: Singleton.InitArguments): SingletonClass;
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
  const [parent, init] = args as [ApiDocument | Container, Singleton.InitArguments];
  merge(this, new SingletonClass(parent, init), {descriptor: true});
} as SingletonConstructor;

Singleton.prototype = SingletonClass.prototype;
Object.assign(Singleton, SingletonDecorator);
Singleton[DECORATOR] = SingletonDecorator;


/**
 * @namespace Singleton
 */
export namespace Singleton {

  export interface InitArguments extends StrictOmit<Combine<Resource.InitArguments,
      SingletonDecorator.Metadata>, 'kind' | 'type'> {
    name: string;
    type: ComplexType;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<SingletonDecorator.Metadata, 'kind' | 'operations' | 'actions'>> {
  }

  // Need for augmentation
  export namespace Action {
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

