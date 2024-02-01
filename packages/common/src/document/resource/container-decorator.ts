import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { ApiActionDecorator, createActionDecorator } from './api-action.decorator.js';
import type { ApiAction } from './api-action.js';
import type { ApiOperation } from './api-operation.js';
import { ResourceDecorator } from './api-resource.decorator.js';
import type { Container } from './container.js';

export function ContainerDecorator(options?: Container.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Container.Kind, options)
}

Object.assign(ContainerDecorator, ResourceDecorator);


export interface ContainerDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Container.DecoratorOptions): ClassDecorator;

  Action: (options?: ApiAction.DecoratorOptions) => ApiActionDecorator;

}

/**
 * @namespace CollectionDecorator
 */
export namespace ContainerDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.Container, 'kind' | 'actions' | 'resources'> {
    kind: OpraSchema.Container.Kind;
    name: string;
    actions?: Record<string, ApiOperation.DecoratorMetadata>;
    resources?: Type[];
  }

}

/*
 * Action PropertyDecorator
 */
export namespace ContainerDecorator {

  /**
   * Action PropertyDecorator
   */
  export function Action(options: ApiOperation.DecoratorOptions): ApiActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, [], list);
  }

}
