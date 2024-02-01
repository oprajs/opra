import merge from 'putil-merge';
import { ApiActionClass } from './api-action.class.js';
import type { ApiEndpoint } from './api-endpoint.js';
import type { ApiResource } from './api-resource';


export namespace ApiAction {
  export interface InitArguments extends ApiEndpoint.InitArguments {
  }

  export interface DecoratorMetadata extends ApiEndpoint.DecoratorMetadata {
  }

  export interface DecoratorOptions extends ApiEndpoint.DecoratorOptions {
  }
}

export interface ApiAction extends ApiActionClass {
}

export interface ApiActionConstructor /* extends ApiActionDecorator */
{
  new(resource: ApiResource, name: string, init: ApiAction.InitArguments): ApiActionClass;

  prototype: ApiActionClass;
}

/**
 * @class ApiAction
 * @decorator ApiAction
 */
export const ApiAction = function (this: ApiActionClass, ...args: any[]) {

  // Decorator
  if (!this) {
    throw new TypeError('ApiAction constructor must be called with "new"');
    // const [type, options] = args;
    // return ApiAction[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [resource, name, init] = args as [ApiResource, string, ApiAction.InitArguments];
  merge(this, new ApiActionClass(resource, name, init), {descriptor: true});
} as unknown as ApiActionConstructor;

ApiAction.prototype = ApiActionClass.prototype;
// Object.assign(ApiAction, ApiActionDecorator);
// ApiAction[DECORATOR] = ApiActionDecorator;
