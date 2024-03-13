import { OpraSchema } from '../../../schema/index.js';
import type { HttpAction } from '../http-action';
import { createHttpEndpointDecorator, HttpEndpointDecorator } from './http-endpoint.decorator.js';

export interface HttpActionDecorator extends HttpEndpointDecorator<HttpActionDecorator> {
}

export function createHttpActionDecorator(
    decoratorChain: Function[],
    options: HttpAction.DecoratorOptions
): HttpActionDecorator {
  return createHttpEndpointDecorator(OpraSchema.Http.Action.Kind, decoratorChain, options);
}
