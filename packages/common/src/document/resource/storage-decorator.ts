import omit from 'lodash.omit';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { SOURCE_METADATA } from '../constants.js';
import { Collection } from './collection.js';
import { Resource } from './resource.js';
import { ResourceDecorator } from './resource-decorator.js';
import type { Storage } from './storage.js';

const NAME_PATTERN = /^(.*)(Resource|Storage|Controller)$/;
type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

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

export function StorageDecorator(options?: Storage.DecoratorOptions): ClassDecorator {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const metadata: Storage.Metadata = Reflect.getOwnMetadata(SOURCE_METADATA, target) || ({} as any);
    metadata.kind = OpraSchema.Storage.Kind;
    metadata.name = name;
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
            (Reflect.getOwnMetadata(SOURCE_METADATA, target.constructor) || {}) as Collection.Metadata;
        sourceMetadata.operations = sourceMetadata.operations || {};
        sourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(SOURCE_METADATA, sourceMetadata, target.constructor);
      });
}
