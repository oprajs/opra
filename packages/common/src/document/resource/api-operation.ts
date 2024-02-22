import merge from 'putil-merge';
import type { StrictOmit } from 'ts-gems';
import type { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { DECORATOR } from '../constants.js';
import { ApiOperationClass } from './api-operation.class.js';
import { ApiOperationDecorator, createOperationDecorator } from './api-operation.decorator.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource.js';
import type { ApiResponse } from './api-response.js';

export interface ApiOperation extends ApiOperationClass {
}

export interface ApiOperationConstructor {
  /**
   * Constructor
   * @param resource
   * @param name
   * @param init
   */
  new(resource: ApiResource, name: string, init: ApiOperation.InitArguments): ApiOperationClass;

  /**
   * Decorator
   * @param options
   */<T extends ApiOperation.DecoratorOptions>(options?: T): ApiOperationDecorator;

  prototype: ApiOperationClass;

}

/**
 * @class ApiOperation
 * @decorator ApiOperation
 */
export const ApiOperation = function (this: ApiOperationClass, ...args: any[]) {

  // Decorator
  if (!this) {
    const [options] = args as [options: ApiOperation.DecoratorOptions];
    const decoratorChain: Function[] = [];
    return (ApiOperation[DECORATOR] as typeof createOperationDecorator).call(undefined, decoratorChain, options);
  }

  // Constructor
  const [resource, name, init] = args as [ApiResource, string, ApiOperation.InitArguments];
  merge(this, new ApiOperationClass(resource, name, init), {descriptor: true});
} as ApiOperationConstructor;

ApiOperation.prototype = ApiOperationClass.prototype;
ApiOperation[DECORATOR] = createOperationDecorator;


/**
 * @namespace ApiOperation
 */
export namespace ApiOperation {
  export interface InitArguments extends StrictOmit<OpraSchema.Operation, 'parameters' | 'response'> {
    headers?: ApiParameter.InitArguments[];
    parameters?: ApiParameter.InitArguments[];
    response?: ApiResponse.InitArguments;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Operation, 'parameters' | 'response'> {
    headers?: ApiParameter.DecoratorMetadata[];
    parameters?: ApiParameter.DecoratorMetadata[];
    response?: ApiResponse.DecoratorMetadata;
    useTypes?: TypeThunkAsync[];
  }

  export interface DecoratorOptions extends Partial<Pick<OpraSchema.Operation, 'description' | 'method'>> {
  }
}
