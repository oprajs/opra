import { StrictOmit, Type } from 'ts-gems';
import { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiOperationDecorator, createOperationDecorator } from './api-operation.decorator.js';
import { ApiOperation } from './api-operation.js';

/** Augmentation **/
declare module './api-operation.js' {

  /**
   * ApiOperationConstructor
   */
  interface ApiOperationConstructor {
    Entity: ApiOperationEntity;
  }

  interface ApiOperationEntity {
    Create(type: Type | string, options?: ApiOperation.Entity.Create.Options): ApiOperation.Entity.CreateDecorator;

    Delete(type: Type | string, options?: ApiOperation.Entity.Delete.Options): ApiOperation.Entity.DeleteDecorator;

    FindMany(type: Type | string, options?: ApiOperation.Entity.FindMany.Options): ApiOperation.Entity.FindManyDecorator;

    FindOne(type: Type | string, options?: ApiOperation.Entity.FindOne.Options): ApiOperation.Entity.FindOneDecorator;

    UpdateMany(type: Type | string, options?: ApiOperation.Entity.UpdateMany.Options): ApiOperation.Entity.UpdateManyDecorator;

    UpdateOne(type: Type | string, options?: ApiOperation.Entity.UpdateOne.Options): ApiOperation.Entity.UpdateOneDecorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace ApiOperation {

    namespace Entity {
      /**
       * @namespace Create
       */
      export namespace Create {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          inputMaxContentSize?: number;
        }
      }

      export type CreateDecorator = ApiOperationDecorator & {};


      /**
       * @namespace Delete
       */
      export namespace Delete {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
        }
      }

      export type DeleteDecorator = ApiOperationDecorator & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): DeleteDecorator;
      };


      /**
       * @namespace FindMany
       */
      export namespace FindMany {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
        }
      }

      export type FindManyDecorator = ApiOperationDecorator & {
        SortFields(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;
        DefaultSort(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): FindManyDecorator;
      };


      /**
       * @namespace FindOne
       */
      export namespace FindOne {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
        }
      }

      export type FindOneDecorator = ApiOperationDecorator & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): FindOneDecorator;
      };


      /**
       * @namespace UpdateMany
       */
      export namespace UpdateMany {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          inputMaxContentSize?: number;
        }
      }

      export type UpdateManyDecorator = ApiOperationDecorator & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateManyDecorator;
      };


      /**
       * @namespace UpdateOne
       */
      export namespace UpdateOne {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          inputMaxContentSize?: number;
        }
      }

      export type UpdateOneDecorator = ApiOperationDecorator & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateManyDecorator;
      };

    }

  }

}

/** Implementation **/

ApiOperation.Entity = {} as any;

/**
 * ApiOperation.Entity.Create
 */
ApiOperation.Entity.Create = function (
    type: Type | string,
    options?: ApiOperation.Entity.Create.Options
): ApiOperation.Entity.CreateDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.CreateDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.Create';
    operationMeta.method = 'POST';
    operationMeta.type = type;
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  return decorator;
}


/**
 * ApiOperation.Entity.Delete
 */
ApiOperation.Entity.Delete = function (
    type: Type | string,
    options?: ApiOperation.Entity.Delete.Options
): ApiOperation.Entity.DeleteDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.DeleteDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.Delete';
    operationMeta.method = 'DELETE';
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          operationMeta.filters = operationMeta.filters || [];
          operationMeta.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}


/**
 * ApiOperation.Entity.FindMany
 */
ApiOperation.Entity.FindMany = function (
    type: Type | string,
    options?: ApiOperation.Entity.FindMany.Options
): ApiOperation.Entity.FindManyDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.FindManyDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.FindMany';
    operationMeta.method = 'GET';
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  decorator.DefaultSort = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => operationMeta.defaultSort = fields);
    return decorator;
  }
  decorator.SortFields = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => operationMeta.sortFields = fields);
    return decorator;
  }
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          operationMeta.filters = operationMeta.filters || [];
          operationMeta.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}


/**
 * ApiOperation.Entity.FindOne
 */
ApiOperation.Entity.FindOne = function (
    type: Type | string,
    options?: ApiOperation.Entity.FindOne.Options
): ApiOperation.Entity.FindOneDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.FindOneDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.FindOne';
    operationMeta.method = 'GET';
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          operationMeta.filters = operationMeta.filters || [];
          operationMeta.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}


/**
 * ApiOperation.Entity.UpdateMany
 */
ApiOperation.Entity.UpdateMany = function (
    type: Type | string,
    options?: ApiOperation.Entity.UpdateMany.Options
): ApiOperation.Entity.UpdateManyDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.UpdateManyDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.UpdateMany';
    operationMeta.method = 'PATCH';
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          operationMeta.filters = operationMeta.filters || [];
          operationMeta.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}


/**
 * ApiOperation.Entity.UpdateOne
 */
ApiOperation.Entity.UpdateOne = function (
    type: Type | string,
    options?: ApiOperation.Entity.UpdateOne.Options
): ApiOperation.Entity.UpdateOneDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.UpdateOneDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Entity.UpdateOne';
    operationMeta.method = 'PATCH';
    operationMeta.type = type;
    if (typeof type === 'function') {
      operationMeta.useTypes = operationMeta.useTypes || [];
      operationMeta.useTypes.push(type);
    }
  });
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          operationMeta.filters = operationMeta.filters || [];
          operationMeta.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}
