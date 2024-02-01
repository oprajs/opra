import { Type } from 'ts-gems';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter';
import type { ApiResource } from './api-resource.js';

export type CrudOperationDecorator = ((target: Object, propertyKey: any) => void) & {
  Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): CrudOperationDecorator;
}

export function createOperationDecorator<T extends CrudOperationDecorator, M extends ApiOperation.DecoratorMetadata>(
    operation: string,
    init: any,
    list: ((operationMeta: M, target: Object, propertyKey: string) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (propertyKey !== operation)
      throw new TypeError(`Name of the handler name should be '${operation}'`);

    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as ApiResource.DecoratorMetadata;
    resourceMetadata.operations = resourceMetadata.operations || {};
    const operationMeta: M = {...init};
    operationMeta.options = operationMeta.options || {};
    resourceMetadata.operations[operation] = operationMeta;
    for (const fn of list)
      fn(operationMeta, target, propertyKey);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as T;

  decorator.Parameter = (name: string, arg0?: ApiParameter.DecoratorOptions | string | Type) => {
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

  return decorator;
}
