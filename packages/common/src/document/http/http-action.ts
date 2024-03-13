import merge from 'putil-merge';
import type { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { DECORATOR } from '../constants.js';
import { createHttpActionDecorator, HttpActionDecorator } from './decorators/http-action.decorator.js';
import { HttpActionClass } from './http-action.class.js';
import { HttpEndpoint } from './http-endpoint.js';
import type { HttpResource } from './http-resource.js';


/**
 * @namespace HttpAction
 */
export namespace HttpAction {
  export interface InitArguments extends HttpEndpoint.InitArguments,
      Pick<OpraSchema.Http.Action, 'kind'> {
  }

  export interface DecoratorMetadata extends StrictOmit<HttpEndpoint.DecoratorMetadata, 'kind'>, Pick<OpraSchema.Http.Action, 'kind'> {
  }

  export interface DecoratorOptions extends Partial<Pick<OpraSchema.Http.Action, 'description'>> {
  }
}

/**
 * @class HttpAction
 */
export interface HttpAction extends HttpActionClass {
}

export interface HttpActionConstructor {
  /**
   * Constructor
   * @param resource
   * @param name
   * @param init
   */
  new(resource: HttpResource, name: string, init: HttpAction.InitArguments): HttpActionClass;

  /**
   * Decorator
   * @param options
   */<T extends HttpAction.DecoratorOptions>(options?: T): HttpActionDecorator;

  prototype: HttpActionClass;
}

/**
 * @class HttpAction
 * @decorator HttpAction
 */
export const HttpAction = function (this: HttpActionClass, ...args: any[]) {

  // Decorator
  if (!this) {
    const [options] = args as [options: HttpAction.DecoratorOptions];
    const decoratorChain: Function[] = [];
    return (HttpAction[DECORATOR] as typeof createHttpActionDecorator).call(undefined, decoratorChain, options);
  }

  // Constructor
  const [resource, name, init] = args as [HttpResource, string, HttpAction.InitArguments];
  merge(this, new HttpActionClass(resource, name, init), {descriptor: true});
} as unknown as HttpActionConstructor;

HttpAction.prototype = HttpActionClass.prototype;
HttpAction[DECORATOR] = createHttpActionDecorator;
