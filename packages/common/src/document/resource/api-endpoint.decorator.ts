import { Type } from 'ts-gems';
import { HttpStatusCode, HttpStatusRange } from '../../http/index.js';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiAction } from './api-action.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource.js';
import type { ApiResponse } from './api-response.js';

export interface ApiEndpointDecorator<T extends ApiEndpointDecorator<any>> {
  (target: Object, propertyKey: string): void;

  // Cookie(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Header(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): T;

  Response(args: ApiResponse.DecoratorOptions): T;

  Response(status?: HttpStatusCode | number | HttpStatusRange | HttpStatusRange[], dataType?: Type | string): T;
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
      const i = meta.parameters.findIndex(x =>
          x.in === 'header' && String(x.name) === String(paramMeta.name)
      );
      if (i >= 0)
        meta.parameters[i] = paramMeta;
      else meta.parameters.push(paramMeta);
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
      const i = meta.parameters.findIndex(x =>
          x.in === 'query' && String(x.name) === String(paramMeta.name));
      if (i >= 0)
        meta.parameters[i] = paramMeta;
      else meta.parameters.push(paramMeta);
    });
    return decorator;
  }

  /**
   *
   */
  decorator.Response = (arg0: any, arg1?: any): any => {
    const responseMeta: ApiResponse.DecoratorMetadata =
        typeof arg0 === 'string' || typeof arg0 === 'number' ? {statusCode: String(arg0), type: arg1} : {...arg0};
    responseMeta.statusCode =
        Array.isArray(responseMeta.statusCode)
            ? responseMeta.statusCode.map(x => String(x))
            : String(responseMeta.statusCode) as any;
    decoratorChain.push(
        (meta: DecoratorMetadata): void => {
          meta.responses = meta.responses || [];
          meta.responses.push(responseMeta);
        }
    )
    return decorator;
  }

  return decorator;
}


export { createEndpointDecorator };
