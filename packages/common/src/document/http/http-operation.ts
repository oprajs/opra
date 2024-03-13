import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import type { OpraSchema } from '../../schema/index.js';
import { DECORATOR } from '../constants.js';
import { createHttpOperationDecorator, HttpOperationDecorator } from './decorators/http-operation.decorator.js';
import { HttpEndpoint } from './http-endpoint.js';
import { HttpOperationClass } from './http-operation.class.js';
import { HttpRequestBody } from './http-request-body.js';
import type { HttpResource } from './http-resource.js';


/**
 * @namespace HttpOperation
 */
export namespace HttpOperation {
  export interface InitArguments extends HttpEndpoint.InitArguments,
      Pick<OpraSchema.Http.Operation, 'kind' | 'method' | 'composition' | 'compositionOptions'> {
  }

  export interface DecoratorMetadata extends StrictOmit<HttpEndpoint.DecoratorMetadata, 'kind'>,
      Pick<OpraSchema.Http.Operation, 'kind' | 'composition' | 'compositionOptions'> {
    requestBody?: HttpRequestBody.DecoratorMetadata;
  }

  export interface DecoratorOptions extends Partial<Pick<OpraSchema.Http.Operation, 'description' | 'method'>> {
    requestBody?: HttpRequestBody.DecoratorOptions;
  }

}

/**
 * @class HttpOperation
 */
export interface HttpOperation extends HttpOperationClass {
}

export interface HttpOperationConstructor {
  /**
   * Constructor
   * @param resource
   * @param name
   * @param init
   */
  new(resource: HttpResource, name: string, init: HttpOperation.InitArguments): HttpOperationClass;

  /**
   * Decorator
   * @param options
   */<T extends HttpOperation.DecoratorOptions>(options?: T): HttpOperationDecorator;

  prototype: HttpOperationClass;

  GET(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

  DELETE(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

  HEAD(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

  PATCH(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

  POST(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

  PUT(options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator;

}

/**
 * @class HttpOperation
 * @decorator HttpOperation
 */
export const HttpOperation = function (this: HttpOperationClass, ...args: any[]) {

  // Decorator
  if (!this) {
    const [options] = args as [options: HttpOperation.DecoratorOptions];
    const decoratorChain: Function[] = [];
    return (HttpOperation[DECORATOR] as typeof createHttpOperationDecorator).call(undefined, decoratorChain, options);
  }

  // Constructor
  const [resource, name, init] = args as [HttpResource, string, HttpOperation.InitArguments];
  merge(this, new HttpOperationClass(resource, name, init), {descriptor: true});
} as HttpOperationConstructor;

HttpOperation.prototype = HttpOperationClass.prototype;
HttpOperation[DECORATOR] = createHttpOperationDecorator;

HttpOperation.GET = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'GET'});
}

HttpOperation.DELETE = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'DELETE'});
}

HttpOperation.HEAD = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'HEAD'});
}

HttpOperation.PATCH = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'PATCH'});
}

HttpOperation.POST = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'POST'});
}

HttpOperation.PUT = function (options?: StrictOmit<HttpOperation.DecoratorOptions, 'method'>): HttpOperationDecorator {
  return createHttpOperationDecorator([], {...options, method: 'PUT'});
}
