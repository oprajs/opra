import merge from 'putil-merge';
import type { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { DECORATOR } from '../constants.js';
import { ApiActionClass } from './api-action.class.js';
import { ApiActionDecorator, createActionDecorator } from './api-action.decorator.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource';
import type { ApiResponse } from './api-response.js';

export interface ApiAction extends ApiActionClass {
}

export interface ApiActionConstructor {
  /**
   * Constructor
   * @param resource
   * @param name
   * @param init
   */
  new(resource: ApiResource, name: string, init: ApiAction.InitArguments): ApiActionClass;

  /**
   * Decorator
   * @param options
   */
  <T extends ApiAction.DecoratorOptions>(options?: T): ApiActionDecorator;

  prototype: ApiActionClass;
}

/**
 * @class ApiAction
 * @decorator ApiAction
 */
export const ApiAction = function (this: ApiActionClass, ...args: any[]) {

  // Decorator
  if (!this) {
    const [options] = args as [options: ApiAction.DecoratorOptions];
    const decoratorChain: Function[] = [];
    return (ApiAction[DECORATOR] as typeof createActionDecorator).call(undefined, decoratorChain, options);
  }

  // Constructor
  const [resource, name, init] = args as [ApiResource, string, ApiAction.InitArguments];
  merge(this, new ApiActionClass(resource, name, init), {descriptor: true});
} as unknown as ApiActionConstructor;

ApiAction.prototype = ApiActionClass.prototype;
ApiAction[DECORATOR] = createActionDecorator;


/**
 * @namespace ApiAction
 */
export namespace ApiAction {
  export interface InitArguments extends StrictOmit<OpraSchema.Action, 'parameters' | 'response'> {
    headers?: ApiParameter.InitArguments[];
    parameters?: ApiParameter.InitArguments[];
    response?: ApiResponse.InitArguments;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Action, 'parameters' | 'response'> {
    headers?: ApiParameter.DecoratorMetadata[];
    parameters?: ApiParameter.DecoratorMetadata[];
    response?: ApiResponse.DecoratorMetadata;
  }

  export interface DecoratorOptions extends Partial<Pick<OpraSchema.Action, 'description'>> {
  }
}
