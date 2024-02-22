import { Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiAction } from './api-action.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource.js';
import type { ApiResponse } from './api-response.js';

export interface ApiEndpointDecorator<T> {
  (target: Object, propertyKey: string): void;

  // Cookie(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Header(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Response(args: ApiResponse.DecoratorOptions): T;

  Response(dataType: TypeThunkAsync | string): T;
}

type DecoratorMetadata = ApiAction.DecoratorMetadata | ApiOperation.DecoratorMetadata;
type DecoratorOptions = ApiAction.DecoratorOptions | ApiOperation.DecoratorOptions;

function createEndpointDecorator(
    kind: OpraSchema.Action.Kind,
    decoratorChain: Function[],
    options?: ApiAction.DecoratorOptions
): ApiEndpointDecorator<any>

function createEndpointDecorator(
    kind: OpraSchema.Operation.Kind,
    decoratorChain: Function[],
    options?: ApiOperation.DecoratorOptions
): ApiEndpointDecorator<any>

function createEndpointDecorator(
    kind: OpraSchema.Action.Kind | OpraSchema.Operation.Kind,
    decoratorChain: Function[],
    options?: DecoratorOptions
): ApiEndpointDecorator<any> {

  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can not be decorated`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as ApiResource.DecoratorMetadata;
    resourceMetadata.endpoints = resourceMetadata.endpoints || {};
    const endpointMeta = {
      kind,
      ...options
    } as DecoratorMetadata;
    resourceMetadata.endpoints[propertyKey] = endpointMeta;
    for (const fn of decoratorChain)
      fn(endpointMeta);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as ApiEndpointDecorator<any>;

  // /**
  //  *
  //  */
  // decorator.Cookie = (name: string | RegExp, arg0?: ApiParameter.DecoratorOptions | string | Type) => {
  //   const opts: ApiParameter.DecoratorOptions =
  //       typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
  //   const paramMeta: ApiParameter.DecoratorMetadata = {
  //     ...opts,
  //     in: 'cookie',
  //     name
  //   }
  //   decoratorChain.push((meta: DecoratorMetadata): void => {
  //     meta.parameters = meta.parameters || [];
  //     meta.parameters.push(paramMeta);
  //   });
  //   return decorator;
  // }

  /**
   *
   */
  decorator.Header = (name: string | RegExp, arg0?: ApiParameter.DecoratorOptions | string | Type) => {
    const opts: ApiParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: ApiParameter.DecoratorMetadata = {
      ...opts,
      in: 'header',
      name
    }
    decoratorChain.push((meta: DecoratorMetadata): void => {
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  }

  /**
   *
   */
  decorator.Parameter = (name: string | RegExp, arg0?: ApiParameter.DecoratorOptions | string | Type) => {
    const opts: ApiParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: ApiParameter.DecoratorMetadata = {
      ...opts,
      in: 'query',
      name
    }
    decoratorChain.push((meta: DecoratorMetadata): void => {
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  }

  /**
   *
   */
  decorator.Response = (args: TypeThunkAsync | string | ApiResponse.DecoratorOptions): any => {
    decoratorChain.push(
        (meta: DecoratorMetadata): void => {
          meta.response = typeof args === 'object' ? {...args} : {type: args};
        }
    )
    return decorator;
  }

  return decorator;
}


export { createEndpointDecorator };
