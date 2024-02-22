import { OpraSchema } from '../../schema/index.js';
import type { ApiAction } from './api-action.js';
import { ApiEndpointDecorator, createEndpointDecorator } from './api-endpoint.decorator.js';

export interface ApiActionDecorator extends ApiEndpointDecorator<ApiActionDecorator> {
}

export function createActionDecorator(
    decoratorChain: Function[],
    options: ApiAction.DecoratorOptions
): ApiActionDecorator {
  return createEndpointDecorator(OpraSchema.Action.Kind, decoratorChain, options);
}
