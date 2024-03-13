import omit from 'lodash.omit';
import merge from 'putil-merge';
import { Type } from 'ts-gems';
import { OpraSchema } from '../../../schema/index.js';
import { TypeThunkAsync } from '../../../types.js';
import { RESOURCE_METADATA } from '../../constants.js';
import type { HttpKeyParameter } from '../http-key-parameter';
import type { HttpResource } from '../http-resource.js';

const CLASS_NAME_PATTERN = /^(.*)(Collection|Singleton|Resource|Controller)$/;

export interface createHttpResourceDecorator {
  <T extends HttpResource.DecoratorOptions>(options?: T): HttpResourceDecorator;
}

export interface HttpResourceDecorator extends ClassDecorator {
  KeyParameter(name: string, optionsOrType?: HttpKeyParameter.DecoratorOptions | string | Type): HttpResourceDecorator;

  UseType(...type: TypeThunkAsync[]): HttpResourceDecorator;
}

export function createHttpResourceDecorator<O extends HttpResource.DecoratorOptions>(
    options?: O
): ClassDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name)
      name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as HttpResource.DecoratorMetadata;
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind: OpraSchema.Http.Resource.Kind,
      name,
      ...omit(options, ['kind', 'name', 'controller', 'endpoints', 'key'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
    for (const fn of decoratorChain)
      fn(metadata);
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  } as HttpResourceDecorator;

  /**
   *
   */
  decorator.KeyParameter = (name: string, arg0?: HttpKeyParameter.DecoratorOptions | string | Type) => {
    const opts: HttpKeyParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: HttpKeyParameter.DecoratorMetadata = {
      type: 'any',
      ...opts,
      name
    }
    decoratorChain.push(
        (meta: HttpResource.DecoratorMetadata): void => {
          meta.keyParameter = {...paramMeta};
        }
    )
    return decorator;
  }

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push(
        (meta: HttpResource.DecoratorMetadata): void => {
          meta.types = meta.types || [];
          meta.types.push(...type);
        }
    )
    return decorator;
  }

  return decorator;
}
