import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { Resource } from './resource.js';
import { SingletonDecorator } from './singleton.decorator.js';
import { SingletonClass } from './singleton-class.js';

export interface Singleton extends SingletonClass {
}

export interface SingletonConstructor extends SingletonDecorator {
  prototype: SingletonClass;

  new(document: ApiDocument, init: Singleton.InitArguments): SingletonClass;
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

  export interface InitArguments extends Combine<Resource.InitArguments,
      StrictOmit<SingletonDecorator.Metadata, 'type'>> {
    name: string;
    type: ComplexType;
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

