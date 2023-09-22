import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ContainerClass } from './container-class.js'
import { ContainerDecorator } from './container-decorator.js';
import { Resource } from './resource.js';

export interface Container extends ContainerClass {
}

export interface ContainerConstructor extends ContainerDecorator {
  prototype: ContainerClass;

  new(document: ApiDocument, init: Container.InitArguments): ContainerClass;
}

/**
 * @class Container
 * @decorator Container
 */
export const Container = function (this: Container | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [options] = args;
    return Container[DECORATOR].call(undefined, options);
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Container.InitArguments];
  merge(this, new ContainerClass(document, init), {descriptor: true});
} as ContainerConstructor;

Container.prototype = ContainerClass.prototype;
Object.assign(Container, ContainerDecorator);
Container[DECORATOR] = ContainerDecorator;


export namespace Container {

  export interface InitArguments extends StrictOmit<Combine<Resource.InitArguments, ContainerDecorator.Metadata>, 'kind' | 'resources'> {
    resources?: Resource[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<ContainerDecorator.Metadata, 'kind' | 'actions'>> {
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
