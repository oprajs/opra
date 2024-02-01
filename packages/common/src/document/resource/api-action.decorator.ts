import { Type } from 'ts-gems';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiAction } from './api-action.js';
import type { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource.js';
import type { ApiResponse } from './api-response.js';

export type ApiActionDecorator = ((target: Object, propertyKey: string) => void) & {
  Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): ApiActionDecorator;

  Returns(args: ApiResponse.DecoratorOptions): ApiActionDecorator;
  Returns(dataType: TypeThunkAsync | string): ApiActionDecorator;
};

export function createActionDecorator<T extends ApiActionDecorator, M extends ApiAction.DecoratorMetadata>(
    options: any,
    bannedProperties: string[] | readonly string[],
    list: ((operationMeta: M) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey === 'string' && bannedProperties.includes(propertyKey as any))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as ApiResource.DecoratorMetadata;
    resourceMetadata.actions = resourceMetadata.actions || {};
    const actionMeta: M = {...options};
    resourceMetadata.actions[propertyKey] = actionMeta;
    for (const fn of list)
      fn(actionMeta);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as T;

  decorator.Parameter = (name: string | RegExp, arg0?: ApiParameter.DecoratorOptions | string | Type) => {
    const opts: ApiParameter.DecoratorOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    const paramMeta: ApiParameter.DecoratorMetadata = {
      ...opts,
      name
    }
    list.push(
        (operationMeta): void => {
          operationMeta.parameters = operationMeta.parameters || [];
          operationMeta.parameters.push(paramMeta);
        }
    )
    return decorator;
  }

  decorator.Returns = (args: TypeThunkAsync | string | ApiResponse.DecoratorOptions): any => {
    list.push(
        (actionMetadata): void => {
          actionMetadata.response = typeof args === 'object' ? {...args} : {type: args};
        }
    )
    return decorator;
  }

  return decorator;
}


