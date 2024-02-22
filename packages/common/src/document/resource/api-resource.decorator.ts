import omit from 'lodash.omit';
import merge from 'putil-merge';
import { Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiKeyParameter } from './api-key-parameter.js';
import type { ApiResource } from './api-resource.js';

const CLASS_NAME_PATTERN = /^(.*)(Collection|Singleton|Resource|Controller)$/;

export interface createApiResourceDecorator {
  <T extends ApiResource.DecoratorOptions>(options?: T): ApiResourceDecorator;
}

export interface ApiResourceDecorator extends ClassDecorator {
  KeyParameter(name: string, optionsOrType?: ApiKeyParameter.DecoratorOptions | string | Type): ApiResourceDecorator;
}

export function createApiResourceDecorator<O extends ApiResource.DecoratorOptions>(
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

    const metadata = {} as ApiResource.DecoratorMetadata;
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind: OpraSchema.Resource.Kind,
      name,
      ...omit(options, ['kind', 'name', 'controller', 'endpoints', 'key'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
    for (const fn of decoratorChain)
      fn(metadata);
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  } as ApiResourceDecorator;

  /**
   *
   */
  decorator.KeyParameter = (name: string, arg0?: ApiKeyParameter.DecoratorOptions | string | Type) => {
    const opts: ApiKeyParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: ApiKeyParameter.DecoratorMetadata = {
      type: 'any',
      ...opts,
      name
    }
    decoratorChain.push(
        (meta: ApiResource.DecoratorMetadata): void => {
          meta.key = {...paramMeta};
        }
    )
    return decorator;
  }

  return decorator;
}
