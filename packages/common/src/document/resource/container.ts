import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { Collection } from './collection.js';
import { ContainerClass } from './container-class.js'
import { ContainerDecorator } from './container-decorator.js';
import type { Resource } from './resource.js';
import { Singleton } from './singleton.js';
import { Storage } from './storage.js';

export interface Container extends ContainerClass {
}

export interface ContainerConstructor extends ContainerDecorator {
  prototype: ContainerClass;

  new(parent: ApiDocument | Container, init: Container.InitArguments): ContainerClass;
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
  const [parent, init] = args as [ApiDocument | Container, Container.InitArguments];
  merge(this, new ContainerClass(parent, init), {descriptor: true});
  if (init.resources) {
    const container = this as ContainerClass;
    init.resources.forEach(r => {
      if (r.kind === 'Container')
        container.resources.set(r.name, new Container(container, r));
      else if (r.kind === 'Storage')
        container.resources.set(r.name, new Storage(container, r));
      else if (r.kind === 'Collection')
        container.resources.set(r.name, new Collection(container, r));
      else if (r.kind === 'Singleton')
        container.resources.set(r.name, new Singleton(container, r));
    });
  }
} as ContainerConstructor;

Container.prototype = ContainerClass.prototype;
Object.assign(Container, ContainerDecorator);
Container[DECORATOR] = ContainerDecorator;


export namespace Container {

  export interface InitArguments extends StrictOmit<Combine<Resource.InitArguments, ContainerDecorator.Metadata>, 'kind' | 'resources'> {
    resources?: ResourceInitializer[];
  }

  export type ResourceInitializer =
      (Collection.InitArguments & { kind: OpraSchema.Collection.Kind })
      | (Singleton.InitArguments & { kind: OpraSchema.Singleton.Kind })
      | (Storage.InitArguments & { kind: OpraSchema.Storage.Kind })
      | (Container.InitArguments & { kind: OpraSchema.Container.Kind });

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
