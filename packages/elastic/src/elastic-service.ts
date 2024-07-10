import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import * as TB from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { TransportRequestOptions } from '@elastic/transport';
import { ComplexType, DataType } from '@opra/common';
import { ServiceBase } from '@opra/core';
import { Type } from 'ts-gems';
import { IsObject } from 'valgen';

/**
 * The namespace for the ElasticService.
 *
 * @namespace ElasticService
 */
export namespace ElasticService {
  export interface Options {
    client?: ElasticService<any>['client'];
    resourceName?: ElasticService<any>['$resourceName'];
    commonFilter?: ElasticService<any>['$commonFilter'];
    interceptor?: ElasticService<any>['$interceptor'];
    idGenerator?: ElasticService<any>['$idGenerator'];
    onError?: ElasticService<any>['$onError'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';

  export interface CommandInfo {
    crud: CrudOp;
    method: string;
    byId: boolean;
    documentId?: any;
    input?: Record<string, any>;
    options?: Record<string, any>;
  }

  // /**
  //  * Represents options for "create" operation
  //  *
  //  * @interface
  //  */
  // export interface CreateOptions extends mongodb.InsertOneOptions {
  //   projection?: string[];
  // }
  //
  // /**
  //  * Represents options for "count" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface CountOptions<T> extends mongodb.CountOptions {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "delete" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface DeleteOptions<T> extends mongodb.DeleteOptions {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "deleteMany" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface DeleteManyOptions<T> extends mongodb.DeleteOptions {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "distinct" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface DistinctOptions<T> extends mongodb.DistinctOptions {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "exists" operation
  //  *
  //  * @interface
  //  */
  // export interface ExistsOptions<T> extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for checking the document exists
  //  *
  //  * @interface
  //  */
  // export interface ExistsOneOptions<T> extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "findOne" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface FindOneOptions<T> extends StrictOmit<FindManyOptions<T>, 'limit'> {}
  //
  // /**
  //  * Represents options for "findMany" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface FindManyOptions<T> extends mongodb.AggregateOptions {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  //   projection?: string | string[] | Document;
  //   sort?: string[];
  //   limit?: number;
  //   skip?: number;
  // }
  //
  // /**
  //  * Represents options for "update" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface UpdateOptions<T>
  //   extends StrictOmit<mongodb.FindOneAndUpdateOptions, 'projection' | 'returnDocument' | 'includeResultMetadata'> {
  //   projection?: string | string[] | Document;
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
  //
  // /**
  //  * Represents options for "updateMany" operation
  //  *
  //  * @interface
  //  * @template T - The type of the document.
  //  */
  // export interface UpdateManyOptions<T> extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
  //   filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  // }
}

/**
 * Class representing a ElasticSearch service for interacting with a collection.
 * @extends ServiceBase
 * @template T - The type of the documents in the collection.
 */
export class ElasticService<T extends object> extends ServiceBase {
  protected _dataType_: Type | string;
  protected _dataType: ComplexType;
  protected _inputCodecs: Record<string, IsObject.Validator<T>> = {};
  protected _outputCodecs: Record<string, IsObject.Validator<T>> = {};

  /**
   * Represents the name of a index in ElasticDB
   */
  $indexName: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   * @type {string}
   */
  $resourceName?: string | ((_this: any) => string);

  /**
   * Represents a ElasticDB database object.
   */
  client?: Client | ((_this: any) => Client);

  /**
   * Generates a new id for new inserting Document.
   *
   */
  $idGenerator?: (_this: any) => any;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param _this - The context object.
   */
  $onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Represents a common filter function for a ElasticService.
   *
   * @type {QueryDslQueryContainer | Function}
   */
  $commonFilter?:
    | QueryDslQueryContainer
    | ((
        args: ElasticService.CommandInfo,
        _this: this,
      ) => QueryDslQueryContainer | Promise<QueryDslQueryContainer> | undefined);

  /**
   * Interceptor function for handling callback execution with provided arguments.
   *
   * @param callback - The callback function to be intercepted.
   * @param {ElasticService.CommandInfo} info - The arguments object containing the following properties:
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  $interceptor?: (callback: () => any, info: ElasticService.CommandInfo, _this: any) => Promise<any>;

  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the returning results
   * @param indexName - The name of the index, or a function that returns the index name
   * @param [options] - The options for the service
   * @constructor
   */
  constructor(dataType: Type | string, options?: ElasticService.Options) {
    super();
    this._dataType_ = dataType;
    this.client = options?.client;
    this.$commonFilter = this.$commonFilter || options?.commonFilter;
    this.$interceptor = this.$interceptor || options?.interceptor;
    this.$indexName = indexName;
    this.$resourceName = options?.resourceName;
    this.$idGenerator = options?.idGenerator;
  }

  /**
   * Retrieves the index name.
   *
   * @protected
   * @returns The index name.
   * @throws {Error} If the index name is not defined.
   */
  getIndexName(): string {
    const out = typeof this.$indexName === 'function' ? this.$indexName(this) : this.$indexName;
    if (out) return out;
    throw new Error('indexName is not defined');
  }

  /**
   * Retrieves the resource name.
   *
   * @protected
   * @returns {string} The resource name.
   * @throws {Error} If the resource name is not defined.
   */
  getResourceName(): string {
    const out =
      typeof this.$resourceName === 'function' ? this.$resourceName(this) : this.$resourceName || this.getIndexName();
    if (out) return out;
    throw new Error('resourceName is not defined');
  }

  /**
   * Retrieves the OPRA data type
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  get dataType(): ComplexType {
    if (!this._dataType) this._dataType = this.context.document.node.getComplexType(this._dataType_);
    return this._dataType;
  }

  /**
   * Retrieves the codec for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  getInputCodec(operation: string): IsObject.Validator<T> {
    let validator = this._inputCodecs[operation];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = { projection: '*' };
    if (operation === 'update') options.partial = 'deep';
    const dataType = this.dataType;
    validator = dataType.generateCodec('decode', options) as IsObject.Validator<T>;
    this._inputCodecs[operation] = validator;
    return validator;
  }

  /**
   * Retrieves the codec.
   */
  getOutputCodec(operation: string): IsObject.Validator<T> {
    let validator = this._outputCodecs[operation];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = { projection: '*', partial: 'deep' };
    const dataType = this.dataType;
    validator = dataType.generateCodec('decode', options) as IsObject.Validator<T>;
    this._outputCodecs[operation] = validator;
    return validator;
  }

  /**
   * Retrieves the ElasticSearch client.
   *
   * @protected
   *
   * @throws {Error} If the context or client is not set.
   */
  getClient(): Client {
    // @ts-ignore
    const db = typeof this.client === 'function' ? this.client(this) : this.client;
    if (!db) throw new Error(`Client not set!`);
    return db;
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns The generated ID.
   */
  protected _generateId(): any {
    return typeof this.$idGenerator === 'function' ? this.$idGenerator(this) : undefined;
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {QueryDslQueryContainer | Promise<QueryDslQueryContainer> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getCommonFilter(
    info: ElasticService.CommandInfo,
  ): QueryDslQueryContainer | Promise<QueryDslQueryContainer> | undefined {
    return typeof this.$commonFilter === 'function' ? this.$commonFilter(info, this) : this.$commonFilter;
  }

  protected async _intercept(callback: (...args: any[]) => any, info: ElasticService.CommandInfo): Promise<any> {
    try {
      if (this.$interceptor) return this.$interceptor(callback, info, this);
      return callback();
    } catch (e: any) {
      Error.captureStackTrace(e, this._intercept);
      await this.$onError?.(e, this);
      throw e;
    }
  }
}
