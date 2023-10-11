import { Type } from 'ts-gems';
import { RESOURCE_METADATA } from '../constants.js';
import { ResourceDecorator } from './resource-decorator.js';

export type OperationDecorator = ((target: Object, propertyKey: any) => void) & {
  Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => OperationDecorator;
}

export function createOperationDecorator<T extends OperationDecorator, M extends ResourceDecorator.OperationMetadata>(
    operation: string,
    options: any,
    list: ((operationMeta: M, target: Object, propertyKey: string) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (propertyKey !== operation)
      throw new TypeError(`Name of the handler name should be '${operation}'`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as ResourceDecorator.Metadata;
    resourceMetadata.operations = resourceMetadata.operations || {};
    const operationMeta: M = {...options};
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
