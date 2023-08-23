import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import { Collection } from '../resource/collection.js';
import { Resource } from '../resource/resource.js';
import type { Storage } from '../resource/storage.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

export function StorageDecorator(options?: Storage.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Storage.Kind, options)
}

export interface StorageDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Storage.DecoratorOptions): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Delete: (options?: Storage.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  Get: (options?: Storage.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  Post: (options?: Storage.PostEndpointOptions) => ((target: Object, propertyKey: 'post') => void);
}

Object.assign(StorageDecorator, ResourceDecorator);
StorageDecorator.Delete = createOperationDecorator('delete');
StorageDecorator.Get = createOperationDecorator('get');
StorageDecorator.Post = createOperationDecorator('post');

StorageDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  const operators = ['delete', 'get', 'post'];
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'string' && operators.includes(propertyKey))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);
    return oldDecorator(target, propertyKey);
  }
}

function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        if (propertyKey !== operation)
          throw new TypeError(`Name of the handler name should be '${operation}'`);
        const operationMeta = {...options};
        const sourceMetadata =
            (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as Collection.Metadata;
        sourceMetadata.operations = sourceMetadata.operations || {};
        sourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(RESOURCE_METADATA, sourceMetadata, target.constructor);
      });
}
