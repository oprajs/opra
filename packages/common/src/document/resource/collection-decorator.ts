import { Combine, StrictOmit, Type } from 'ts-gems';
import type { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { EnumType } from '../data-type/enum-type.js';
import { ApiActionDecorator, createActionDecorator } from './api-action.decorator.js';
import type { ApiAction } from './api-action.js';
import { createOperationDecorator } from './api-operation.decorator.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter';
import { ResourceDecorator } from './api-resource.decorator.js';
import type { Collection } from './collection.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'deleteMany', 'get', 'findMany', 'update', 'updateMany'] as const;
type OperationProperties = typeof operationProperties[number];

export function CollectionDecorator(type: Type | string, options?: Collection.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Collection.Kind, {...options, type})
}

Object.assign(CollectionDecorator, ResourceDecorator);


export interface CollectionDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Action: (options?: ApiAction.DecoratorOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ApiActionDecorator;

  Create: typeof CollectionDecorator.Create;
  Delete: typeof CollectionDecorator.Delete;
  DeleteMany: typeof CollectionDecorator.DeleteMany;
  Get: typeof CollectionDecorator.Get;
  FindMany: typeof CollectionDecorator.FindMany;
  Update: typeof CollectionDecorator.Update;
  UpdateMany: typeof CollectionDecorator.UpdateMany;
}


/**
 * @namespace CollectionDecorator
 */
export namespace CollectionDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.Collection, 'kind' | 'type' | 'operations' | 'actions'> {
    kind: OpraSchema.Collection.Kind;
    name: string;
    type: TypeThunkAsync | string;
    actions?: Record<string, ApiOperation.DecoratorMetadata>;
    operations?: {
      create: Create.Metadata;
      delete: Delete.Metadata;
      deleteMany: DeleteMany.Metadata;
      get: Get.Metadata;
      findMany: FindMany.Metadata;
      update: Update.Metadata;
      updateMany: UpdateMany.Metadata;
    }
  }

  export interface FieldDecoratorOptions extends Partial<StrictOmit<OpraSchema.Field, 'type'>> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  /**
   * @namespace Create
   */
  export namespace Create {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.Create> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.Create>> {
    }
  }

  // const a: Create.Options = {};
  // a.

  /**
   * @namespace Delete
   */
  export namespace Delete {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.Delete> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.Delete>> {
    }
  }

  /**
   * @namespace DeleteMany
   */
  export namespace DeleteMany {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.DeleteMany> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.DeleteMany>> {
    }
  }

  /**
   * @namespace FindMany
   */
  export namespace FindMany {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.FindMany> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.FindMany>> {
    }
  }

  /**
   * @namespace Get
   */
  export namespace Get {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.Get> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.Get>> {
    }
  }

  /**
   * @namespace Update
   */
  export namespace Update {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.Update> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.Update>> {
    }
  }

  /**
   * @namespace UpdateMany
   */
  export namespace UpdateMany {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Collection.Operations.UpdateMany> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Collection.Operations.UpdateMany>> {
    }
  }

}

/*
 * Action PropertyDecorator
 */
export namespace CollectionDecorator {
  /**
   * Action PropertyDecorator
   */
  export function Action(options: ApiOperation.DecoratorOptions): ApiActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, operationProperties, list);
  }

  /**
   * Create PropertyDecorator
   */
  export type CreateDecorator = ((target: Object, propertyKey: 'create') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): CreateDecorator;
    InputMaxContentSize(sizeInBytes: number): CreateDecorator;
    InputPickFields(...fields: Field.QualifiedName[]): CreateDecorator;
    InputOmitFields(...fields: Field.QualifiedName[]): CreateDecorator;
    InputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): CreateDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): CreateDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): CreateDecorator;
    OutputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): CreateDecorator;
  };

  export function Create(options?: Create.Options): CreateDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<CreateDecorator, Create.Metadata>('create', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputOmitFields = fields)
      return decorator;
    }
    decorator.InputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.inputOverwriteFields = fields)
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputOmitFields = fields)
      return decorator;
    }
    decorator.OutputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.outputOverwriteFields = fields)
      return decorator;
    }
    return decorator;
  }

  /**
   * Delete PropertyDecorator
   */
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): DeleteDecorator;
  };

  export function Delete(options?: Delete.Options): DeleteDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createOperationDecorator<DeleteDecorator, Delete.Metadata>('delete', options, list);
  }

  /**
   * DeleteMany PropertyDecorator
   */
  export type DeleteManyDecorator = ((target: Object, propertyKey: 'deleteMany') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): DeleteManyDecorator;
    Filter(field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): DeleteManyDecorator;
  };

  export function DeleteMany(options?: DeleteMany.Options): DeleteManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<DeleteManyDecorator, DeleteMany.Metadata>('deleteMany', options, list);
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/)
            .filter(s => s) as OpraFilter.ComparisonOperator[]
      list.push(
          operationMeta => {
            operationMeta.options.filters = operationMeta.options.filters || [];
            operationMeta.options.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    return decorator;
  }

  /**
   * Get PropertyDecorator
   */
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): GetDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): GetDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): GetDecorator;
    OutputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): GetDecorator;
  };

  export function Get(options?: Get.Options): GetDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<GetDecorator, Get.Metadata>('get', options, list);
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputOmitFields = fields)
      return decorator;
    }
    decorator.OutputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.outputOverwriteFields = fields)
      return decorator;
    }
    return decorator;
  }

  /**
   * FindMany PropertyDecorator
   */
  export type FindManyDecorator = ((target: Object, propertyKey: 'findMany') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): FindManyDecorator;
    SortFields(...fields: Field.QualifiedName[]): FindManyDecorator;
    DefaultSort(...fields: Field.QualifiedName[]): FindManyDecorator;
    Filter(field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): FindManyDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): FindManyDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): FindManyDecorator;
    OutputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): FindManyDecorator;
  };

  export function FindMany(options?: FindMany.Options): FindManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<FindManyDecorator, FindMany.Metadata>('findMany', options, list);
    decorator.SortFields = (...fields: string[]) => {
      list.push(operationMeta => operationMeta.options.sortFields = fields);
      return decorator;
    }
    decorator.DefaultSort = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.defaultSort = fields);
      return decorator;
    }
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
      list.push(
          operationMeta => {
            operationMeta.options.filters = operationMeta.options.filters || [];
            operationMeta.options.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputOmitFields = fields)
      return decorator;
    }
    decorator.OutputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.outputOverwriteFields = fields)
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
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): UpdateDecorator;
    InputMaxContentSize(sizeInBytes: number): UpdateDecorator;
    InputPickFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    InputOmitFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    InputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): UpdateDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    OutputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): UpdateDecorator;
  };

  export function Update(options?: Update.Options): UpdateDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<UpdateDecorator, Update.Metadata>('update', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputOmitFields = fields)
      return decorator;
    }
    decorator.InputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.inputOverwriteFields = fields)
      return decorator;
    }
    decorator.OutputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputPickFields = fields)
      return decorator;
    }
    decorator.OutputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.outputOmitFields = fields)
      return decorator;
    }
    decorator.OutputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.outputOverwriteFields = fields)
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
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): UpdateManyDecorator;
    InputMaxContentSize(sizeInBytes: number): UpdateManyDecorator;
    InputPickFields(...fields: Field.QualifiedName[]): UpdateManyDecorator;
    InputOmitFields(...fields: Field.QualifiedName[]): UpdateManyDecorator;
    InputOverwriteFields(fields: Record<string, FieldDecoratorOptions>): UpdateManyDecorator;
    Filter(field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateManyDecorator;
  };

  export function UpdateMany(options?: UpdateMany.Options): UpdateManyDecorator
  export function UpdateMany(description?: string): UpdateManyDecorator
  export function UpdateMany(arg0?: any): UpdateManyDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<UpdateManyDecorator, UpdateMany.Metadata>('updateMany', options, list);
    decorator.InputMaxContentSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.inputMaxContentSize = sizeInBytes)
      return decorator;
    }
    decorator.InputPickFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputPickFields = fields)
      return decorator;
    }
    decorator.InputOmitFields = (...fields: Field.QualifiedName[]) => {
      list.push(operationMeta => operationMeta.options.inputOmitFields = fields)
      return decorator;
    }
    decorator.InputOverwriteFields = (fields: Record<string, FieldDecoratorOptions>) => {
      list.push(operationMeta => operationMeta.options.inputOverwriteFields = fields)
      return decorator;
    }
    decorator.Filter = (field: Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
      if (typeof operators === 'string')
        operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[]
      list.push(
          operationMeta => {
            operationMeta.options.filters = operationMeta.options.filters || [];
            operationMeta.options.filters.push(omitUndefined({field, operators, notes}));
          }
      )
      return decorator;
    }
    return decorator;
  }
}
