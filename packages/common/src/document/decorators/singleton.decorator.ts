import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { Resource } from '../resource/resource.js';
import type { Singleton } from '../resource/singleton.js';
import { buildOperationDecorator } from './build-operation-decorator.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'get', 'update'] as const;
type OperationProperties = typeof operationProperties[number];

export function SingletonDecorator(type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Singleton.Kind, {...options, type})
}

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

Object.assign(SingletonDecorator, ResourceDecorator);
SingletonDecorator.Create = buildOperationDecorator('create');
SingletonDecorator.Get = buildOperationDecorator('get');
SingletonDecorator.Delete = buildOperationDecorator('delete');
SingletonDecorator.Update = buildOperationDecorator('update');

SingletonDecorator.Action = function (options: any): PropertyDecorator {
  const oldDecorator = ResourceDecorator.Action(options);
  const operators = ['create', 'delete', 'get', 'update'];
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'string' && operators.includes(propertyKey))
      throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);
    return oldDecorator(target, propertyKey);
  }
}
