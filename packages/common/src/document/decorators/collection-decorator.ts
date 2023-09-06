import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { Collection } from '../resource/collection';
import { Resource } from '../resource/resource.js';
import { buildOperationDecorator } from './build-operation-decorator.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'deleteMany', 'get', 'findMany', 'update', 'updateMany'] as const;
type OperationProperties = typeof operationProperties[number];

export function CollectionDecorator(type: Type | string, options?: Collection.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Collection.Kind, {...options, type})
}

const operationDecorators = {
  Create: buildOperationDecorator<Collection.CreateEndpointOptions>('create'),
  Delete: buildOperationDecorator<Collection.DeleteEndpointOptions>('delete'),
  DeleteMany: buildOperationDecorator<Collection.DeleteManyEndpointOptions>('deleteMany'),
  Get: buildOperationDecorator<Collection.GetEndpointOptions>('get'),
  FindMany: buildOperationDecorator<Collection.FindManyEndpointOptions>('findMany'),
  Update: buildOperationDecorator<Collection.UpdateEndpointOptions>('update'),
  UpdateMany: buildOperationDecorator<Collection.UpdateManyEndpointOptions>('updateMany')
}

Object.assign(CollectionDecorator, ResourceDecorator);
Object.assign(CollectionDecorator, operationDecorators);

CollectionDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'string' && operationProperties.includes(propertyKey as any))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);
    return oldDecorator(target, propertyKey);
  }
}

export interface CollectionDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Create: typeof operationDecorators.Create;
  Delete: typeof operationDecorators.Delete;
  DeleteMany: typeof operationDecorators.DeleteMany;
  Get: typeof operationDecorators.Get;
  FindMany: (options?: Collection.FindManyEndpointOptions) => ((target: Object, propertyKey: 'findMany') => void);
  Update: (options?: Collection.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
  UpdateMany: (options?: Collection.UpdateManyEndpointOptions) => ((target: Object, propertyKey: 'updateMany') => void);
}

