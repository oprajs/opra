import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { HTTP_CONTROLLER_METADATA } from '../constants.js';
import type { HttpController } from '../http/http-controller.js';
import type { HttpParameter } from '../http/http-parameter.js';

const CLASS_NAME_PATTERN = /^(.*)(Controller)$/;

export interface HttpControllerDecorator<T extends HttpControllerDecorator<any> = HttpControllerDecorator<any>>
  extends ClassDecorator {
  Cookie(
    name: string | RegExp,
    optionsOrType?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ): T;

  Header(
    name: string | RegExp,
    optionsOrType?: StrictOmit<HttpParameter.Options, 'location'> | string | TypeThunkAsync | false,
  ): T;

  QueryParam(
    name: string | RegExp,
    optionsOrType?: StrictOmit<HttpParameter.Options, 'location'> | string | TypeThunkAsync | false,
  ): T;

  PathParam(
    name: string | RegExp,
    optionsOrType?: StrictOmit<HttpParameter.Options, 'location'> | string | TypeThunkAsync | false,
  ): T;

  KeyParam(
    name: string | RegExp,
    optionsOrType?: StrictOmit<HttpParameter.Options, 'location'> | string | TypeThunkAsync | false,
  ): T;

  UseType(...type: TypeThunkAsync[]): T;
}

export interface HttpControllerDecoratorFactory {
  <T extends HttpController.Options>(options?: T): HttpControllerDecorator;
}

export function HttpControllerDecoratorFactory<O extends HttpController.Options>(options?: O): HttpControllerDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name) name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as HttpController.Metadata;
    const baseMetadata = Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata) merge(metadata, baseMetadata, { deep: true });
    const oldMetadata = Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, target);
    if (oldMetadata) merge(metadata, oldMetadata, { deep: true });
    merge(
      metadata,
      {
        kind: OpraSchema.HttpController.Kind,
        name,
        path: name,
        ...omit(options, ['kind', 'name', 'instance', 'endpoints', 'key']),
      },
      { deep: true },
    );
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, metadata, target);
    for (const fn of decoratorChain) fn(metadata);
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, metadata, target);
  } as HttpControllerDecorator;

  /**
   *
   */
  decorator.Cookie = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ) => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'cookie',
              type: arg1,
            }
          : { ...arg1, name, location: 'cookie' };
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Header = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ) => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'header',
              type: arg1,
            }
          : { ...arg1, name, location: 'header' };
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.QueryParam = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ) => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'query',
              type: arg1,
            }
          : { ...arg1, name, location: 'query' };
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.PathParam = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ) => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'path',
              type: arg1,
            }
          : { ...arg1, name, location: 'path' };
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.KeyParam = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type | false,
  ) => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      if (!meta.path?.includes(':' + name)) meta.path = (meta.path || '') + '@:' + name;
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'path',
              type: arg1,
              keyParam: true,
            }
          : {
              ...arg1,
              name,
              location: 'path',
              keyParam: true,
            };
      meta.parameters = meta.parameters || [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: HttpController.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  return decorator;
}
