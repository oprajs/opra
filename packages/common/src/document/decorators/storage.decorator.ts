import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { Resource } from '../resource/resource.js';
import type { Storage } from '../resource/storage.js';
import { buildOperationDecorator } from './build-operation-decorator.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

export function StorageDecorator(options?: Storage.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Storage.Kind, options)
}

const operationDecorators = {
  Delete: buildOperationDecorator<Storage.DeleteEndpointOptions>('delete'),
  Get: buildOperationDecorator<Storage.GetEndpointOptions>('get'),
  Post: buildOperationDecorator<Storage.PostEndpointOptions>('post')
}

Object.assign(StorageDecorator, ResourceDecorator);
Object.assign(StorageDecorator, operationDecorators);

StorageDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  const operators = ['delete', 'get', 'post'];
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'string' && operators.includes(propertyKey))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);
    return oldDecorator(target, propertyKey);
  }
}

export interface StorageDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Storage.DecoratorOptions): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Delete: typeof operationDecorators.Delete;
  Get: typeof operationDecorators.Get;
  Post: typeof operationDecorators.Post;
}
