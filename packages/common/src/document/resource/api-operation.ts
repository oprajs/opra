import merge from 'putil-merge';
import type { StrictOmit } from 'ts-gems';
import type { OpraSchema } from '../../schema/index';
import { ApiOperationClass } from './api-operation.class.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource';
import type { ApiResponse } from './api-response.js';


export namespace ApiOperation {
  export interface InitArguments extends StrictOmit<OpraSchema.Operation, 'headers' | 'parameters' | 'response'> {
    headers?: ApiParameter.InitArguments[];
    parameters?: ApiParameter.InitArguments[];
    response?: ApiResponse.InitArguments;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Operation, 'headers' | 'parameters' | 'response'> {
    headers?: ApiParameter.DecoratorMetadata[];
    parameters?: ApiParameter.DecoratorMetadata[];
    response?: ApiResponse.DecoratorMetadata;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Operation, 'headers' | 'parameters' | 'response'>> {
  }
}


export interface ApiOperation extends ApiOperationClass {
}

export interface ApiOperationConstructor /* extends ApiOperationDecorator */
{
  new(resource: ApiResource, name: string, init: ApiOperation.InitArguments): ApiOperationClass;

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
  const [resource, name, init] = args as [ApiResource, string, ApiOperation.InitArguments];
  merge(this, new ApiOperationClass(resource, name, init), {descriptor: true});
} as unknown as ApiOperationConstructor;

ApiOperation.prototype = ApiOperationClass.prototype;
// Object.assign(ApiOperation, ApiOperationDecorator);
// ApiOperation[DECORATOR] = ApiOperationDecorator;
