import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { SOURCE_METADATA } from '../constants.js';
import type { Collection } from './collection.js';
import { Resource } from './resource.js';
import { ResourceDecorator } from './resource-decorator.js';

const NAME_PATTERN = /^(.*)(Resource|Collection|Controller)$/;
type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'deleteMany', 'get', 'findMany', 'update', 'updateMany'] as const;
type OperationProperties = typeof operationProperties[number];

export interface CollectionDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Create: (options?: Collection.CreateEndpointOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Collection.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  DeleteMany: (options?: Collection.DeleteManyEndpointOptions) => ((target: Object, propertyKey: 'deleteMany') => void);
  Get: (options?: Collection.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  FindMany: (options?: Collection.FindManyEndpointOptions) => ((target: Object, propertyKey: 'findMany') => void);
  Update: (options?: Collection.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
  UpdateMany: (options?: Collection.UpdateManyEndpointOptions) => ((target: Object, propertyKey: 'updateMany') => void);
}

export function CollectionDecorator(type: Type | string, options?: Collection.DecoratorOptions): ClassDecorator {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const metadata: Collection.Metadata = Reflect.getOwnMetadata(SOURCE_METADATA, target) || ({} as any);
    const baseMetadata = Reflect.getOwnMetadata(SOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata) {
      merge(metadata, baseMetadata, {deep: true});
    }
    metadata.kind = OpraSchema.Collection.Kind;
    metadata.name = name;
    metadata.type = type;
    // Merge with previous metadata object
    const m = Reflect.getMetadata(SOURCE_METADATA, target);
    if (m && metadata !== m)
      Object.assign(metadata, omit(m), Object.keys(metadata));
    // Merge options
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name', 'type', 'controller']));
    Reflect.defineMetadata(SOURCE_METADATA, metadata, target);
  }
}


Object.assign(CollectionDecorator, ResourceDecorator);
CollectionDecorator.Create = createOperationDecorator('create');
CollectionDecorator.Delete = createOperationDecorator('delete');
CollectionDecorator.DeleteMany = createOperationDecorator('deleteMany');
CollectionDecorator.Get = createOperationDecorator('get');
CollectionDecorator.FindMany = createOperationDecorator('findMany');
CollectionDecorator.Update = createOperationDecorator('update');
CollectionDecorator.UpdateMany = createOperationDecorator('updateMany');

CollectionDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'string' && operationProperties.includes(propertyKey as any))
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
            (Reflect.getOwnMetadata(SOURCE_METADATA, target.constructor) || {}) as Collection.Metadata;
        sourceMetadata.operations = sourceMetadata.operations || {};
        sourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(SOURCE_METADATA, sourceMetadata, target.constructor);
      });
}
