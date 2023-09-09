import { StrictOmit, Type } from 'ts-gems';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import { Resource } from '../resource/resource.js';
import type { Singleton } from '../resource/singleton.js';
import { OperationDecorator } from './build-operation-decorator.js';
import { CollectionDecorator } from './collection-decorator.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'get', 'update'] as const;
type OperationProperties = typeof operationProperties[number];

export function SingletonDecorator(type: Type | string, options?: Singleton.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Singleton.Kind, {...options, type})
}

Object.assign(SingletonDecorator, ResourceDecorator);


export interface SingletonDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Action: (options?: Resource.ActionOptions) => (<T, K extends keyof T>(
      target: T,
      propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
          // eslint-disable-next-line max-len
          `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void);

  Create: typeof SingletonDecorator.Create;
  Delete: typeof SingletonDecorator.Delete;
  Get: typeof SingletonDecorator.Get;
  Update: typeof SingletonDecorator.Update;
}

/*
 * Action PropertyDecorator
 */
export namespace SingletonDecorator {
  export function Action(options: any): PropertyDecorator {
    const oldDecorator = ResourceDecorator.Action(options);
    const operators = ['create', 'delete', 'get', 'update'];
    return (target: Object, propertyKey: string | symbol): void => {
      if (typeof propertyKey === 'string' && operators.includes(propertyKey))
        throw new TypeError(`The "${propertyKey}" property is reserved for "${propertyKey}" operations and cannot be used as an action'`);
      return oldDecorator(target, propertyKey);
    }
  }
}

/*
 * Create PropertyDecorator
 */
export namespace SingletonDecorator {
  export type CreateDecorator = ((target: Object, propertyKey: 'create') => void) & {
    Parameter: (name: string, options?: OperationDecorator.Options) => CreateDecorator;
    InputMaxContentSize: (sizeInBytes: number) => CreateDecorator;
    InputPickFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    InputOmitFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
  };

  export function Create(options?: OpraSchema.Singleton.Operations.Create): CreateDecorator
  export function Create(description?: string): CreateDecorator
  export function Create(arg0?: any): CreateDecorator {
    return CollectionDecorator.Create(arg0);
  }
}

/*
 * Get PropertyDecorator
 */
export namespace SingletonDecorator {
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter: (name: string, options?: OperationDecorator.Options) => GetDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => GetDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => GetDecorator;
  };

  export function Get(options?: OpraSchema.Singleton.Operations.Get): GetDecorator
  export function Get(description?: string): GetDecorator
  export function Get(arg0?: any): GetDecorator {
    return CollectionDecorator.Get(arg0);
  }
}

/*
 * Delete PropertyDecorator
 */
export namespace SingletonDecorator {
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter: (name: string, options?: OperationDecorator.Options) => DeleteDecorator;
  };

  export function Delete(options?: OpraSchema.Singleton.Operations.Delete): DeleteDecorator
  export function Delete(description?: string): DeleteDecorator
  export function Delete(arg0?: any): DeleteDecorator {
    return CollectionDecorator.Delete(arg0);
  }
}

/*
 * Update PropertyDecorator
 */
export namespace SingletonDecorator {
  export type UpdateDecorator = ((target: Object, propertyKey: 'update') => void) & {
    Parameter: (name: string, options?: OperationDecorator.Options) => UpdateDecorator;
    InputMaxContentSize: (sizeInBytes: number) => UpdateDecorator;
    InputPickFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    InputOmitFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
  };

  export function Update(options?: OpraSchema.Singleton.Operations.Update): UpdateDecorator
  export function Update(description?: string): UpdateDecorator
  export function Update(arg0?: any): UpdateDecorator {
    return CollectionDecorator.Update(arg0);
  }
}

