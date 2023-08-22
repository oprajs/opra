import omit from 'lodash.omit';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { SOURCE_METADATA } from '../constants.js';
import { Collection } from './collection.js';
import { Resource } from './resource.js';
import { ResourceDecorator } from './resource-decorator.js';
import type { Singleton } from './singleton.js';

const NAME_PATTERN = /^(.*)(Resource|Singleton|Controller)$/;
type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'get', 'update'] as const;
type OperationProperties = typeof operationProperties[number];

export interface SingletonDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Create: (options?: Singleton.CreateEndpointOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Singleton.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  Get: (options?: Singleton.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  Update: (options?: Singleton.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
}

export function SingletonDecorator(type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const metadata: Singleton.Metadata = Reflect.getOwnMetadata(SOURCE_METADATA, target) || ({} as any);
    metadata.kind = OpraSchema.Singleton.Kind;
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

Object.assign(SingletonDecorator, ResourceDecorator);
SingletonDecorator.Create = createOperationDecorator('create');
SingletonDecorator.Get = createOperationDecorator('get');
SingletonDecorator.Delete = createOperationDecorator('delete');
SingletonDecorator.Update = createOperationDecorator('update');

SingletonDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  const operators = ['create', 'delete', 'get', 'update'];
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
