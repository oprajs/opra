import { StrictOmit, Type } from 'ts-gems';
import type { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { Collection } from '../resource/collection';
import {
  ActionDecorator,
  createActionDecorator,
  createOperationDecorator,
  ResourceDecorator
} from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'deleteMany', 'get', 'findMany', 'update', 'updateMany'] as const;
type OperationProperties = typeof operationProperties[number];

export function CollectionDecorator(type: Type | string, options?: Collection.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Collection.Kind, {...options, type})
}

Object.assign(CollectionDecorator, ResourceDecorator);


export interface CollectionDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Action: (options?: ResourceDecorator.ActionOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ActionDecorator;

  Create: typeof CollectionDecorator.Create;
  Delete: typeof CollectionDecorator.Delete;
  DeleteMany: typeof CollectionDecorator.DeleteMany;
  Get: typeof CollectionDecorator.Get;
  FindMany: typeof CollectionDecorator.FindMany;
  Update: typeof CollectionDecorator.Update;
  UpdateMany: typeof CollectionDecorator.UpdateMany;
}

/*
 * Action PropertyDecorator
 */
export namespace CollectionDecorator {
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
export namespace CollectionDecorator {
  export type CreateDecorator = ((target: Object, propertyKey: 'create') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => CreateDecorator;
    InputMaxContentSize: (sizeInBytes: number) => CreateDecorator;
    InputPickFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    InputOmitFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => CreateDecorator;
  };

  export function Create(options?: OpraSchema.Collection.Operations.Create): CreateDecorator
  export function Create(description?: string): CreateDecorator
  export function Create(arg0?: any): CreateDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<CreateDecorator>('create', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputOmitFields = fields)
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputOmitFields = fields)
      return decorator;
    }
    return decorator;
  }
}

/*
 * Delete PropertyDecorator
 */
export namespace CollectionDecorator {
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => DeleteDecorator;
  };

  export function Delete(options?: OpraSchema.Collection.Operations.Delete): DeleteDecorator
  export function Delete(description?: string): DeleteDecorator
  export function Delete(arg0?: any): DeleteDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    return createOperationDecorator<DeleteDecorator>('delete', options, list);
  }
}

/*
 * DeleteMany PropertyDecorator
 */
export namespace CollectionDecorator {
  export type DeleteManyDecorator = ((target: Object, propertyKey: 'deleteMany') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => DeleteManyDecorator;
    Filter: (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => DeleteManyDecorator;
  };

  export function DeleteMany(options?: OpraSchema.Collection.Operations.DeleteMany): DeleteManyDecorator
  export function DeleteMany(description?: string): DeleteManyDecorator
  export function DeleteMany(arg0?: any): DeleteManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<DeleteManyDecorator>('deleteMany', options, list);
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[]
      list.push(
          operationMeta => {
            operationMeta.filters = operationMeta.filters || [];
            operationMeta.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    return decorator;
  }
}

/*
 * Get PropertyDecorator
 */
export namespace CollectionDecorator {
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => GetDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => GetDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => GetDecorator;
  };

  export function Get(options?: OpraSchema.Collection.Operations.Get): GetDecorator
  export function Get(description?: string): GetDecorator
  export function Get(arg0?: any): GetDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<GetDecorator>('get', options, list);
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputOmitFields = fields)
      return decorator;
    }
    return decorator;
  }
}

/*
 * FindMany PropertyDecorator
 */
export namespace CollectionDecorator {
  export type FindManyDecorator = ((target: Object, propertyKey: 'findMany') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => FindManyDecorator;
    SortFields: (...fields: Field.QualifiedName[]) => FindManyDecorator;
    DefaultSort: (...fields: Field.QualifiedName[]) => FindManyDecorator;
    Filter: (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => FindManyDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => FindManyDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => FindManyDecorator;
  };

  export function FindMany(options?: OpraSchema.Collection.Operations.FindMany): FindManyDecorator
  export function FindMany(description?: string): FindManyDecorator
  export function FindMany(arg0?: any): FindManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<FindManyDecorator>('findMany', options, list);
    decorator.SortFields = (...fields: string[]) => {
      list.push(operationMeta => operationMeta.sortFields = fields);
      return decorator;
    }
    decorator.DefaultSort = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.defaultSort = fields);
      return decorator;
    }
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
      list.push(
          operationMeta => {
            operationMeta.filters = operationMeta.filters || [];
            operationMeta.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputOmitFields = fields)
      return decorator;
    }
    return decorator;
  }
}

/*
 * Update PropertyDecorator
 */
export namespace CollectionDecorator {
  export type UpdateDecorator = ((target: Object, propertyKey: 'update') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => UpdateDecorator;
    InputMaxContentSize: (sizeInBytes: number) => UpdateDecorator;
    InputPickFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    InputOmitFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    OutputPickFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
    OutputOmitFields: (...fields: Field.QualifiedName[]) => UpdateDecorator;
  };

  export function Update(options?: OpraSchema.Collection.Operations.Update): UpdateDecorator
  export function Update(description?: string): UpdateDecorator
  export function Update(arg0?: any): UpdateDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<UpdateDecorator>('update', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputOmitFields = fields)
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.outputOmitFields = fields)
      return decorator;
    }
    return decorator;
  }
}

/*
 * UpdateMany PropertyDecorator
 */
export namespace CollectionDecorator {
  export type UpdateManyDecorator = ((target: Object, propertyKey: 'updateMany') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => UpdateManyDecorator;
    InputMaxContentSize: (sizeInBytes: number) => UpdateManyDecorator;
    InputPickFields: (...fields: Field.QualifiedName[]) => UpdateManyDecorator;
    InputOmitFields: (...fields: Field.QualifiedName[]) => UpdateManyDecorator;
    Filter: (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => UpdateManyDecorator;
  };

  export function UpdateMany(options?: OpraSchema.Collection.Operations.Update): UpdateManyDecorator
  export function UpdateMany(description?: string): UpdateManyDecorator
  export function UpdateMany(arg0?: any): UpdateManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<UpdateManyDecorator>('updateMany', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.inputOmitFields = fields)
      return decorator;
    }
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[]
      list.push(
          operationMeta => {
            operationMeta.filters = operationMeta.filters || [];
            operationMeta.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    return decorator;
  }
}
