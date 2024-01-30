import merge from 'putil-merge';
import type { ApiEndpoint } from './api-endpoint.js';
import { ApiOperationClass } from './api-operation.class.js';
import type { Resource } from './resource.js';


export namespace ApiOperation {
  export interface InitArguments extends ApiEndpoint.InitArguments {
  }

  export interface DecoratorMetadata extends ApiEndpoint.DecoratorMetadata {
  }

  export interface DecoratorOptions extends ApiEndpoint.DecoratorOptions {
  }
}


export interface ApiOperation extends ApiOperationClass {
}

export interface ApiOperationConstructor /* extends ApiOperationDecorator */
{
  new(resource: Resource, name: string, init: ApiOperation.InitArguments): ApiOperationClass;

  prototype: ApiOperationClass;
}

/**
 * @class ApiOperation
 * @decorator ApiOperation
 */
export const ApiOperation = function (this: ApiOperationClass, ...args: any[]) {

  // Decorator
  if (!this) {
    throw new TypeError('ApiOperation constructor must be called with "new"');
    // const [type, options] = args;
    // return ApiOperation[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [resource, name, init] = args as [Resource, string, ApiOperation.InitArguments];
  merge(this, new ApiOperationClass(resource, name, init), {descriptor: true});
} as unknown as ApiOperationConstructor;

ApiOperation.prototype = ApiOperationClass.prototype;
// Object.assign(ApiOperation, ApiOperationDecorator);
// ApiOperation[DECORATOR] = ApiOperationDecorator;
