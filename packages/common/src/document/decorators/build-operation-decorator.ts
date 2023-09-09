import 'reflect-metadata';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';

export namespace OperationDecorator {
  export interface Options extends Omit<OpraSchema.Endpoint.Parameter, 'type'> {
    type?: OpraSchema.DataType.Name | OpraSchema.DataType | TypeThunkAsync;
    enum?: OpraSchema.EnumObject | string[];
  }
}

export type OperationDecorator = ((target: Object, propertyKey: any) => void) & {
  Parameter: (name: string, options?: OperationDecorator.Options) => OperationDecorator;
}

export function createOperationDecorator<T extends OperationDecorator>(
    operation: string,
    options: any,
    list: ((operationMeta: any) => void)[]
): T {
  const decorator = ((target: Object, propertyKey: any): void => {
    if (propertyKey !== operation)
      throw new TypeError(`Name of the handler name should be '${operation}'`);
    const operationMeta = {...options};
    const resourceMetadata = (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {});
    resourceMetadata.operations = resourceMetadata.operations || {};
    resourceMetadata.operations[operation] = operationMeta;
    for (const fn of list)
      fn(operationMeta);
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }) as T;
  decorator.Parameter = (name: string) => {
    list.push(
        (operationMeta): void => {
          operationMeta.parameters = operationMeta.parameters || {};
          operationMeta.parameters[name] = {};
        }
    )
    return decorator;
  }
  return decorator;
}
