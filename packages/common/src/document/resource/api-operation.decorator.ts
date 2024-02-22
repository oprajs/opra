import { OpraSchema } from '../../schema/index.js';
import { ApiEndpointDecorator, createEndpointDecorator } from './api-endpoint.decorator.js';
import type { ApiOperation } from './api-operation.js';

export interface ApiOperationDecorator extends ApiEndpointDecorator<ApiOperationDecorator> {
}

export function createOperationDecorator(
    decoratorChain: Function[],
    options?: ApiOperation.DecoratorOptions
): ApiOperationDecorator {
  return createEndpointDecorator(OpraSchema.Operation.Kind, decoratorChain, options);
}
