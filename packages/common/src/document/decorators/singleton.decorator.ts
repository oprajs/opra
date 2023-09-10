import { StrictOmit, Type } from 'ts-gems';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { Singleton } from '../resource/singleton.js';
import { CollectionDecorator } from './collection-decorator.js';
import {
  ActionDecorator,
  createActionDecorator,
  createOperationDecorator,
  ResourceDecorator
} from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'get', 'update'] as const;
type OperationProperties = typeof operationProperties[number];

export function SingletonDecorator(type: Type | string, options?: Singleton.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Singleton.Kind, {...options, type})
}

Object.assign(SingletonDecorator, ResourceDecorator);


export interface SingletonDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Action: (options?: ResourceDecorator.ActionOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ActionDecorator;

  Create: typeof SingletonDecorator.Create;
  Delete: typeof SingletonDecorator.Delete;
  Get: typeof SingletonDecorator.Get;
  Update: typeof SingletonDecorator.Update;
}

/*
 * Action PropertyDecorator
 */
export namespace SingletonDecorator {
  export function Action(options: ResourceDecorator.ActionOptions): ActionDecorator
  export function Action(description: string): ActionDecorator
  export function Action(arg0?: any): ActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    return createActionDecorator(options, operationProperties, list);
  }
}

/*
 * Create PropertyDecorator
 */
export namespace SingletonDecorator {
  export type CreateDecorator = ((target: Object, propertyKey: 'create') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => CreateDecorator;
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
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => GetDecorator;
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
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => DeleteDecorator;
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
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => UpdateDecorator;
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

