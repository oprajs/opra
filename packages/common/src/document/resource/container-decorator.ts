import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { ActionDecorator, createActionDecorator } from './action-decorator.js';
import { CollectionDecorator } from './collection-decorator.js';
import type { Container } from './container.js';
import { ResourceDecorator } from './resource-decorator.js';

export function ContainerDecorator(options?: Container.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Container.Kind, options)
}

Object.assign(ContainerDecorator, ResourceDecorator);


export interface ContainerDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Container.DecoratorOptions): ClassDecorator;

  Action: (options?: CollectionDecorator.Action.Options) => ActionDecorator;

}

/**
 * @namespace CollectionDecorator
 */
export namespace ContainerDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.Container, 'kind' | 'actions' | 'resources'> {
    kind: OpraSchema.Container.Kind;
    name: string;
    actions?: Record<string, ResourceDecorator.OperationMetadata>;
    resources?: Type[];
  }

  /**
   * @namespace Action
   */
  export namespace Action {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends ResourceDecorator.OperationMetadata {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends ResourceDecorator.OperationOptions {
    }
  }

}

/*
 * Action PropertyDecorator
 */
export namespace ContainerDecorator {

  /**
   * Action PropertyDecorator
   */
  export function Action(options: ResourceDecorator.OperationOptions): ActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, [], list);
  }

}
