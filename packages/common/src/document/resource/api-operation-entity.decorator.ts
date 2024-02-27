import { StrictOmit, Type } from 'ts-gems';
import { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { HttpStatusCode, MimeTypes } from '../../http/index.js';
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
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method' | 'requestBody'> {
          input?: {
            type?: Type | string;
            maxContentSize?: number;
          },
        }
      }

      export type CreateDecorator = ApiOperationDecorator<CreateDecorator> & {};


      /**
       * @namespace Delete
       */
      export namespace Delete {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
        }
      }

      export type DeleteDecorator = ApiOperationDecorator<DeleteDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): DeleteDecorator;
      };


      /**
       * @namespace FindMany
       */
      export namespace FindMany {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          defaultLimit?: number;
          maxLimit?: number;
        }
      }

      export type FindManyDecorator = ApiOperationDecorator<FindManyDecorator> & {
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

      export type FindOneDecorator = ApiOperationDecorator<FindOneDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): FindOneDecorator;
      };


      /**
       * @namespace UpdateMany
       */
      export namespace UpdateMany {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          input?: {
            type?: Type | string;
            maxContentSize?: number;
          },
        }
      }

      export type UpdateManyDecorator = ApiOperationDecorator<UpdateManyDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateManyDecorator;
      };


      /**
       * @namespace UpdateOne
       */
      export namespace UpdateOne {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          input?: {
            type?: Type | string;
            maxContentSize?: number;
          },
        }
      }

      export type UpdateOneDecorator = ApiOperationDecorator<UpdateOneDecorator> & {
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
  return createOperationDecorator<ApiOperation.Entity.CreateDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'POST',
    composition: 'Entity.Create',
    requestBody: {
      required: true,
      maxContentSize: options?.input?.maxContentSize
    }
  })).Parameter('pick', {type: String, isArray: true, description: 'Determines fields to be picked'})
      .Parameter('omit', {type: String, isArray: true, description: 'Determines fields to be omitted'})
      .Parameter('include', {type: String, isArray: true, description: 'Determines fields to be included'})
      .RequestContent(options?.input?.type || type)
      .Response({
        statusCode: HttpStatusCode.CREATED,
        contentType: MimeTypes.opra_instance_json,
        type
      });
}


/**
 * ApiOperation.Entity.Delete
 */
ApiOperation.Entity.Delete = function (
    type: Type | string,
    options?: ApiOperation.Entity.Delete.Options
): ApiOperation.Entity.DeleteDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator<ApiOperation.Entity.DeleteDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'DELETE',
    composition: 'Entity.Delete'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_response_json,
  });
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
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
  const decorator = createOperationDecorator<ApiOperation.Entity.FindManyDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Entity.FindMany'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_collection_json,
    type,
  }).Parameter('limit', {type: Number, description: 'Determines number of returning instances'})
      .Parameter('skip', {type: Number, description: 'Determines number of instances to be skipped'})
      .Parameter('pick', {type: String, isArray: true, description: 'Determines fields to be picked'})
      .Parameter('omit', {type: String, isArray: true, description: 'Determines fields to be omitted'})
      .Parameter('include', {type: String, isArray: true, description: 'Determines fields to be included'})
      .Parameter('count', {type: Boolean, description: 'Counts all matching instances if enabled'});


  decorator.DefaultSort = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
      const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
      compositionOptions.defaultSort = fields;
    });
    return decorator;
  }
  decorator.SortFields = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decorator.Parameter('sort', {type: String, isArray: true, description: 'Determines sort fields'});
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
      const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
      compositionOptions.sortFields = fields;
    });
    return decorator;
  }
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
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
  const decorator = createOperationDecorator<ApiOperation.Entity.FindOneDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Entity.FindOne'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_instance_json,
    type,
  });

  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
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
  const decorator = createOperationDecorator<ApiOperation.Entity.UpdateManyDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'PATCH',
    composition: 'Entity.UpdateMany',
    requestBody: {
      required: true,
      maxContentSize: options?.input?.maxContentSize
    }
  })).RequestContent(options?.input?.type || type)
      .Response({
        statusCode: HttpStatusCode.OK,
        contentType: MimeTypes.opra_response_json
      });

  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
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
  const decorator = createOperationDecorator<ApiOperation.Entity.UpdateOneDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'PATCH',
    composition: 'Entity.UpdateOne',
    requestBody: {
      required: true,
      maxContentSize: options?.input?.maxContentSize
    }
  })).Parameter('pick', {type: String, isArray: true, description: 'Determines fields to be picked'})
      .Parameter('omit', {type: String, isArray: true, description: 'Determines fields to be omitted'})
      .Parameter('include', {type: String, isArray: true, description: 'Determines fields to be included'})
      .RequestContent(options?.input?.type || type)
      .Response({
        statusCode: HttpStatusCode.OK,
        contentType: MimeTypes.opra_instance_json,
        type,
      });

  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}
