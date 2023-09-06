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

export type OperationDecorator = PropertyDecorator & {
  Parameter: (name: string, options?: OperationDecorator.Options) => OperationDecorator;
}

export function buildOperationDecorator<T>(operation: string): ((options?: T) => OperationDecorator) {
  return (options?: T) => {
    const mergeMetadata: any = {};
    const decorator = ((target: Object, propertyKey: string | symbol): void => {
      if (propertyKey !== operation)
        throw new TypeError(`Name of the handler name should be '${operation}'`);
      const operationMeta = {...options};
      const resourceMetadata = (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {});
      resourceMetadata.operations = resourceMetadata.operations || {};
      resourceMetadata.operations[operation] = operationMeta;
      Object.assign(operationMeta, mergeMetadata);
      Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
    }) as OperationDecorator;
    decorator.Parameter = (name: string) => {
      mergeMetadata.parameters = mergeMetadata.parameters || {};
      mergeMetadata.parameters[name] = {};
      return decorator;
    }
    return decorator;
  }
}
