import omit from 'lodash.omit';
import merge from 'putil-merge';
import { Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunk, TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { Resource } from '../resource/resource';

export interface ResourceDecorator {
  Action: (options?: ResourceDecorator.ActionOptions) => ResourceDecorator;
}

export function ResourceDecorator<O extends Resource.DecoratorOptions>(kind: OpraSchema.Resource.Kind, meta?: O): ClassDecorator {
  const namePattern = new RegExp(`^(.*)(${kind}|Resource|Controller)$`);
  return function (target: Function) {
    const name = meta?.name || namePattern.exec(target.name)?.[1] || target.name;
    const metadata: Resource.Metadata = {kind, name};
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata: Resource.Metadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind,
      name,
      ...omit(meta, ['kind', 'name', 'controller'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  }
}

export namespace ResourceDecorator {

  export interface ActionOptions extends OpraSchema.Endpoint {
  }

  export interface ParameterOptions extends Omit<OpraSchema.Endpoint.Parameter, 'type'> {
    type?: OpraSchema.DataType.Name | OpraSchema.DataType | TypeThunk | TypeThunkAsync;
    enum?: OpraSchema.EnumObject | string[];
  }
}


export type OperationDecorator = ((target: Object, propertyKey: any) => void) & {
  Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => OperationDecorator;
}

export function createOperationDecorator<T extends OperationDecorator>(
    operation: string,
    options: any,
    list: ((operationMeta: any, target: Object, propertyKey: string) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (propertyKey !== operation)
      throw new TypeError(`Name of the handler name should be '${operation}'`);
    const resourceMetadata = (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {});
    resourceMetadata.operations = resourceMetadata.operations || {};
    const operationMeta = {...options};
    resourceMetadata.operations[operation] = operationMeta;
    for (const fn of list)
      fn(operationMeta, target, propertyKey);
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
  return decorator;
}


export type ActionDecorator = ((target: Object, propertyKey: string) => void) & {
  Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => ActionDecorator;
};

export function createActionDecorator<T extends ActionDecorator>(
    options: any,
    bannedProperties: string[] | readonly string[],
    list: ((operationMeta: any) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey === 'string' && bannedProperties.includes(propertyKey as any))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as Resource.Metadata;
    resourceMetadata.actions = resourceMetadata.actions || {};
    const actionMeta = {...options};
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
  return decorator;
}


