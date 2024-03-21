import { StrictOmit, Type } from 'ts-gems';
import { OpraFilter } from '../../../filter/index.js';
import { omitUndefined } from '../../../helpers/index.js';
import { HttpStatusCode, MimeTypes } from '../../../http/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA } from '../../constants.js';
import { HttpOperation } from '../http-operation.js';
import { createHttpOperationDecorator, HttpOperationDecorator } from './http-operation.decorator.js';

/** Augmentation **/
declare module '../http-operation' {

  /**
   * HttpOperationConstructor
   */
  interface HttpOperationConstructor {
    Entity: HttpOperationEntity;
  }

  interface HttpOperationEntity {
    Create(type: Type | string, options?: HttpOperation.Entity.CreateOptions): HttpOperation.Entity.CreateDecorator;

    Delete(type: Type | string, keyField: string, options?: HttpOperation.Entity.DeleteOptions): HttpOperation.Entity.DeleteDecorator;

    DeleteMany(type: Type | string, options?: HttpOperation.Entity.DeleteManyOptions): HttpOperation.Entity.DeleteManyDecorator;

    FindMany(type: Type | string, options?: HttpOperation.Entity.FindManyOptions): HttpOperation.Entity.FindManyDecorator;

    Get(type: Type | string, keyField: string, options?: HttpOperation.Entity.GetOptions): HttpOperation.Entity.GetDecorator;

    Update(type: Type | string, keyField: string, options?: HttpOperation.Entity.UpdateOptions): HttpOperation.Entity.UpdateDecorator;

    UpdateMany(type: Type | string, options?: HttpOperation.Entity.UpdateManyOptions): HttpOperation.Entity.UpdateManyDecorator;

  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace HttpOperation {

    namespace Entity {

      /** Create */
      export type CreateDecorator = HttpOperationDecorator<CreateDecorator> & {};

      export interface CreateOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method' | 'requestBody'> {
        input?: {
          type?: Type | string;
          maxContentSize?: number;
        },
      }


      /** Delete */
      export type DeleteDecorator = HttpOperationDecorator<DeleteDecorator> & {};

      export interface DeleteOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
      }


      /** DeleteMany */
      export type DeleteManyDecorator = HttpOperationDecorator<DeleteManyDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): DeleteManyDecorator;
      };

      export interface DeleteManyOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
      }


      /** FindMany */
      export type FindManyDecorator = HttpOperationDecorator<FindManyDecorator> & {
        SortFields(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;
        DefaultSort(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): FindManyDecorator;
      };

      export interface FindManyOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
        defaultLimit?: number;
        maxLimit?: number;
      }


      /** Get */
      export type GetDecorator = HttpOperationDecorator<GetDecorator> & {};

      export interface GetOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
      }


      /** Update */
      export type UpdateDecorator = HttpOperationDecorator<UpdateDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateDecorator;
      };

      export interface UpdateOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
        input?: {
          type?: Type | string;
          maxContentSize?: number;
        },
      }


      /** UpdateMany */
      export type UpdateManyDecorator = HttpOperationDecorator<UpdateManyDecorator> & {
        Filter(field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string): UpdateManyDecorator;
      };

      export interface UpdateManyOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
        input?: {
          type?: Type | string;
          maxContentSize?: number;
        },
      }
    }

  }

}


/** Implementation **/

HttpOperation.Entity = {} as any;

/**
 * HttpOperation.Entity.Create
 */
HttpOperation.Entity.Create = function (
    type: Type | string,
    options?: HttpOperation.Entity.CreateOptions
): HttpOperation.Entity.CreateDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.CreateDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'POST',
    composition: 'Entity.Create',
    requestBody: {
      required: true,
      maxContentSize: options?.input?.maxContentSize
    }
  })).Parameter('fields', {type: String, isArray: true, description: 'Determines fields to be exposed'})
      .RequestContent(options?.input?.type || type)
      .Response({
        statusCode: HttpStatusCode.CREATED,
        contentType: MimeTypes.opra_instance_json,
        type,
        partial: true,
      });
  if (typeof type === 'function')
    decorator.UseType(type)

  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
      }
  )
  return decorator;
}


/**
 * HttpOperation.Entity.Delete
 */
HttpOperation.Entity.Delete = function (
    type: Type | string,
    keyField: string,
    options?: HttpOperation.Entity.DeleteOptions
): HttpOperation.Entity.DeleteDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.DeleteDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'DELETE',
    composition: 'Entity.Delete'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_response_json,
  });
  if (typeof type === 'function')
    decorator.UseType(type)
  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
        compositionOptions.keyField = keyField;
      }
  )
  return decorator;
}

/**
 * HttpOperation.Entity.DeleteMany
 */
HttpOperation.Entity.DeleteMany = function (
    type: Type | string,
    options?: HttpOperation.Entity.DeleteManyOptions
): HttpOperation.Entity.DeleteManyDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.DeleteManyDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'DELETE',
    composition: 'Entity.DeleteMany'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_response_json,
  });
  if (typeof type === 'function')
    decorator.UseType(type)
  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
      }
  )
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
          const compositionOptions = operationMeta.compositionOptions!;
          compositionOptions.filters = compositionOptions.filters || [];
          compositionOptions.filters.push(omitUndefined({field, operators, notes}));
        }
    )
    return decorator;
  }
  return decorator;
}


/**
 * HttpOperation.Entity.FindMany
 */
HttpOperation.Entity.FindMany = function (
    type: Type | string,
    options?: HttpOperation.Entity.FindManyOptions
): HttpOperation.Entity.FindManyDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.FindManyDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Entity.FindMany'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_collection_json,
    type,
    partial: true,
  }).Parameter('limit', {type: Number, description: 'Determines number of returning instances'})
      .Parameter('skip', {type: Number, description: 'Determines number of instances to be skipped'})
      .Parameter('fields', {type: String, isArray: true, description: 'Determines fields to be exposed'})
      .Parameter('count', {type: Boolean, description: 'Counts all matching instances if enabled'});
  if (typeof type === 'function')
    decorator.UseType(type)

  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
      }
  );
  decorator.DefaultSort = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
      const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
      compositionOptions.defaultSort = fields;
    });
    return decorator;
  }
  decorator.SortFields = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decorator.Parameter('sort', {type: String, isArray: true, description: 'Determines sort fields'});
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
      const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
      compositionOptions.sortFields = fields;
    });
    return decorator;
  }
  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
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
 * HttpOperation.Entity.Get
 */
HttpOperation.Entity.Get = function (
    type: Type | string,
    keyField: string,
    options?: HttpOperation.Entity.GetOptions
): HttpOperation.Entity.GetDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.GetDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Entity.Get'
  })).Response({
    statusCode: HttpStatusCode.OK,
    contentType: MimeTypes.opra_instance_json,
    type,
    partial: true,
  });
  if (typeof type === 'function')
    decorator.UseType(type)

  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
        compositionOptions.keyField = keyField;
      }
  );
  return decorator;
}


/**
 * HttpOperation.Entity.UpdateMany
 */
HttpOperation.Entity.UpdateMany = function (
    type: Type | string,
    options?: HttpOperation.Entity.UpdateManyOptions
): HttpOperation.Entity.UpdateManyDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.UpdateManyDecorator>(decoratorChain, omitUndefined({
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
      })
  if (typeof type === 'function')
    decorator.UseType(type)

  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
      }
  );

  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
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
 * HttpOperation.Entity.Update
 */
HttpOperation.Entity.Update = function (
    type: Type | string,
    keyField: string,
    options?: HttpOperation.Entity.UpdateOptions
): HttpOperation.Entity.UpdateDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createHttpOperationDecorator<HttpOperation.Entity.UpdateDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'PATCH',
    composition: 'Entity.Update',
    requestBody: {
      required: true,
      maxContentSize: options?.input?.maxContentSize
    }
  })).Parameter('fields', {type: String, isArray: true, description: 'Determines fields to be exposed'})
      .RequestContent(options?.input?.type || type)
      .Response({
        statusCode: HttpStatusCode.OK,
        contentType: MimeTypes.opra_instance_json,
        type,
        partial: true,
      });
  if (typeof type === 'function')
    decorator.UseType(type);

  decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
        const compositionOptions = operationMeta.compositionOptions = operationMeta.compositionOptions || {};
        compositionOptions.type = getDataTypeName(type);
        compositionOptions.keyField = keyField;
      }
  );

  decorator.Filter = (field: OpraSchema.Field.QualifiedName, operators?: OpraFilter.ComparisonOperator[] | string, notes?: string) => {
    decorator.Parameter('filter', {type: String, description: 'Determines filter fields'});
    if (typeof operators === 'string')
      operators = operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[];
    decoratorChain.push((operationMeta: HttpOperation.DecoratorMetadata) => {
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
 *
 * @param typ
 */
function getDataTypeName(typ: Type | string): string {
  if (typeof typ === 'string')
    return typ;
  const metadata = Reflect.getMetadata(DATATYPE_METADATA, typ);
  if (metadata?.name)
    return metadata.name;
  throw new TypeError(`Type (${typ}) is not decorated with any datatype decorators`);
}
