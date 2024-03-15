import { Type } from 'ts-gems';
import { HttpStatusCode } from '../../../http/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { RESOURCE_METADATA } from '../../constants.js';
import type { HttpAction } from '../http-action.js';
import { HttpEndpointResponse, HttpStatusRange } from '../http-endpoint-response.js';
import type { HttpOperation } from '../http-operation.js';
import type { HttpParameter } from '../http-parameter';
import type { HttpResource } from '../http-resource.js';

export interface HttpEndpointDecorator<T extends HttpEndpointDecorator<any>> {
  (target: Object, propertyKey: string): void;

  // Cookie(name: string | RegExp, optionsOrType?: HttpParameter.DecoratorOptions | string | Type): T;

  Header(name: string | RegExp, optionsOrType?: HttpParameter.DecoratorOptions | string | Type): T;

  Parameter(name: string | RegExp, optionsOrType?: HttpParameter.DecoratorOptions | string | Type): T;

  Response(args: HttpEndpointResponse.DecoratorOptions): T;

  Response(status?: HttpStatusCode | number | HttpStatusRange | HttpStatusRange[], dataType?: Type | string): T;

  UseType(...type: Type[]): T;

}

type DecoratorMetadata = HttpAction.DecoratorMetadata | HttpOperation.DecoratorMetadata;
type DecoratorOptions = HttpAction.DecoratorOptions | HttpOperation.DecoratorOptions;

function createHttpEndpointDecorator(
    kind: OpraSchema.Http.Action.Kind,
    decoratorChain: Function[],
    options?: HttpAction.DecoratorOptions
): HttpEndpointDecorator<any>

function createHttpEndpointDecorator(
    kind: OpraSchema.Http.Operation.Kind,
    decoratorChain: Function[],
    options?: HttpOperation.DecoratorOptions
): HttpEndpointDecorator<any>

function createHttpEndpointDecorator(
    kind: OpraSchema.Http.Action.Kind | OpraSchema.Http.Operation.Kind,
    decoratorChain: Function[],
    options?: DecoratorOptions
): HttpEndpointDecorator<any> {

  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can not be decorated`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as HttpResource.DecoratorMetadata;
    resourceMetadata.endpoints = resourceMetadata.endpoints || {};
    const endpointMeta = {
      kind,
      ...options
    } as DecoratorMetadata;
    resourceMetadata.endpoints[propertyKey] = endpointMeta;
    for (const fn of decoratorChain)
      fn(endpointMeta);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as HttpEndpointDecorator<any>;

  // /**
  //  *
  //  */
  // decorator.Cookie = (name: string | RegExp, arg0?: HttpParameter.DecoratorOptions | string | Type) => {
  //   const opts: HttpParameter.DecoratorOptions =
  //       typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
  //   const paramMeta: HttpParameter.DecoratorMetadata = {
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
  decorator.Header = (name: string | RegExp, arg0?: HttpParameter.DecoratorOptions | string | Type) => {
    const opts: HttpParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: HttpParameter.DecoratorMetadata = {
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
  decorator.Parameter = (name: string | RegExp, arg0?: HttpParameter.DecoratorOptions | string | Type) => {
    const opts: HttpParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: HttpParameter.DecoratorMetadata = {
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
    const responseMeta: HttpEndpointResponse.DecoratorMetadata =
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

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push(
        (meta: DecoratorMetadata): void => {
          meta.types = meta.types || [];
          meta.types.push(...type);
        }
    )
    return decorator;
  }

  return decorator;
}


export { createHttpEndpointDecorator };
