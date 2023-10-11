import { Type } from 'ts-gems';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import { ResourceDecorator } from './resource-decorator.js';

export type ActionDecorator = ((target: Object, propertyKey: string) => void) & {
  Parameter(name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type): ActionDecorator;

  Returns(t: TypeThunkAsync | string): ActionDecorator;
};

export function createActionDecorator<T extends ActionDecorator, M extends ResourceDecorator.ActionMetadata>(
    options: any,
    bannedProperties: string[] | readonly string[],
    list: ((operationMeta: M) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey === 'string' && bannedProperties.includes(propertyKey as any))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as ResourceDecorator.Metadata;
    resourceMetadata.actions = resourceMetadata.actions || {};
    const actionMeta: M = {...options};
    resourceMetadata.actions[propertyKey] = actionMeta;
    for (const fn of list)
      fn(actionMeta);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as T;

  decorator.Parameter = (name: string, arg0?: ResourceDecorator.ParameterOptions | string | Type) => {
    const parameterOptions: ResourceDecorator.ParameterOptions =
        typeof arg0 === 'string' || typeof arg0 === 'function' ? {type: arg0} : {...arg0};
    list.push(
        (operationMeta): void => {
          operationMeta.parameters = operationMeta.parameters || {};
          operationMeta.parameters[name] = {...parameterOptions};
        }
    )
    return decorator;
  }

  decorator.Returns = (t: TypeThunkAsync | string): any => {
    list.push(
        (actionMetadata): void => {
          actionMetadata.returnType = t;
        }
    )
    return decorator;
  }

  return decorator;
}


