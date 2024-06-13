import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { IsObject } from 'valgen';
import { ComplexType, DataType, InternalServerError } from '@opra/common';
import { ServiceBase } from '@opra/core';
import { EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { SQBAdapter } from './sqb-adapter.js';

/**
 * @namespace SqbEntityService
 */
export namespace SqbEntityService {
  export interface Options {
    db?: SqbEntityService<any>['db'];
    resourceName?: SqbEntityService<any>['$resourceName'];
    onError?: SqbEntityService<any>['$onError'];
    commonFilter?: SqbEntityService<any>['$commonFilter'];
    interceptor?: SqbEntityService<any>['$interceptor'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';

  export interface CommandInfo {
    crud: SqbEntityService.CrudOp;
    method: string;
    byId: boolean;
    documentId?: SQBAdapter.IdOrIds;
    input?: Record<string, any>;
    options?: Record<string, any>;
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends Repository.CreateOptions {}

  /**
   * Represents options for "count" operation
   *
   * @interface
   */
  export interface CountOptions extends Repository.CountOptions {}

  /**
   * Represents options for "delete" operation
   *
   * @interface
   */
  export interface DeleteOptions extends Repository.DeleteOptions {}

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   */
  export interface DeleteManyOptions extends Repository.DeleteManyOptions {}

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions extends Repository.ExistsOptions {}

  /**
   * Represents options for "existsOne" operation
   *
   * @interface
   */
  export interface ExistsOneOptions extends Repository.ExistsOptions {}

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   */
  export interface FindOneOptions extends Repository.FindOneOptions {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   */
  export interface FindManyOptions extends Repository.FindManyOptions {}

  /**
   * Represents options for "update" operation
   *
   * @interface
   */
  export interface UpdateOptions extends Repository.UpdateOptions {}

  /**
   * Represents options for "updateOnly" operation
   *
   * @interface
   */
  export interface UpdateOnlyOptions extends Repository.UpdateOptions {}

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   */
  export interface UpdateManyOptions extends Repository.UpdateManyOptions {}
}

/**
 * @class SqbEntityService
 * @template T - The data type class type of the resource
 */
export class SqbEntityService<T extends object = object> extends ServiceBase {
  protected _dataType_: Type | string;
  protected _dataType: ComplexType;
  protected _dataTypeClass?: Type;
  protected _entityMetadata?: EntityMetadata;
  protected _encoders: Record<string, IsObject.Validator<T>> = {};
  protected _decoder?: IsObject.Validator<T>;

  /**
   * Represents a SqbClient or SqbConnection object
   */
  db?: (SqbClient | SqbConnection) | ((_this: any) => SqbClient | SqbConnection);
  /**
   * Represents the name of a resource.
   * @type {string}
   */
  $resourceName?: string | ((_this: any) => string);

  /**
   * Represents a common filter function for a service.
   *
   * @type {SqbEntityService.Filter | Function}
   */
  $commonFilter?:
    | SQBAdapter.FilterInput
    | ((
        args: SqbEntityService.CommandInfo,
        _this: this,
      ) => SQBAdapter.FilterInput | Promise<SQBAdapter.FilterInput> | undefined);

  /**
   * Interceptor function for handling callback execution with provided arguments.
   *
   * @param {Function} callback - The callback function to be intercepted.
   * @param {SqbEntityService.CommandInfo} info - The arguments object containing the following properties:
   * @param {SqbEntityService} _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  $interceptor?: (callback: () => any, info: SqbEntityService.CommandInfo, _this: any) => Promise<any>;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param {SqbEntityService} _this - The context object.
   */
  $onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the returning results
   * @param [options] - The options for the service.
   * @constructor
   */
  constructor(dataType: Type<T> | string, options?: SqbEntityService.Options) {
    super();
    this._dataType_ = dataType;
    this.db = options?.db;
    this.$resourceName = options?.resourceName;
    this.$commonFilter = this.$commonFilter || options?.commonFilter;
    this.$interceptor = this.$interceptor || options?.interceptor;
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
   * Retrieves the Class of the data type
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  get dataTypeClass(): Type {
    if (!this._dataTypeClass) this._dataTypeClass = this.entityMetadata.ctor;
    return this._dataTypeClass;
  }

  /**
   * Retrieves the SQB entity metadata object
   *
   * @throws {TypeError} If metadata is not available
   */
  get entityMetadata(): EntityMetadata {
    if (!this._entityMetadata) {
      const t = this.dataType.ctor!;
      const metadata = EntityMetadata.get(t);
      if (!metadata) throw new TypeError(`Class (${t}) is not decorated with $Entity() decorator`);
      this._entityMetadata = metadata;
    }
    return this._entityMetadata!;
  }

  /**
   * Retrieves the resource name.
   *
   * @returns {string} The resource name.
   * @throws {Error} If the collection name is not defined.
   */
  getResourceName(): string {
    const out =
      typeof this.$resourceName === 'function' ? this.$resourceName(this) : this.$resourceName || this.dataType.name;
    if (out) return out;
    throw new Error('resourceName is not defined');
  }

  /**
   * Retrieves the encoder for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  getEncoder(operation: 'create' | 'update'): IsObject.Validator<T> {
    let encoder = this._encoders[operation];
    if (encoder) return encoder;
    const options: DataType.GenerateCodecOptions = { projection: '*' };
    if (operation === 'update') options.partial = 'deep';
    const dataType = this.dataType;
    encoder = dataType.generateCodec('encode', options) as IsObject.Validator<T>;
    this._encoders[operation] = encoder;
    return encoder;
  }

  /**
   * Retrieves the decoder.
   */
  getDecoder(): IsObject.Validator<T> {
    let decoder = this._decoder;
    if (decoder) return decoder;
    const options: DataType.GenerateCodecOptions = { projection: '*', partial: 'deep' };
    const dataType = this.dataType;
    decoder = dataType.generateCodec('decode', options) as IsObject.Validator<T>;
    this._decoder = decoder;
    return decoder;
  }

  /**
   * Insert a new record into database
   *
   * @param {PartialDTO<T>} input - The input data
   * @param {SqbEntityService.CreateOptions} [options] - The options object
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created resource
   * @throws {InternalServerError} if an unknown error occurs while creating the resource
   * @protected
   */
  protected async _create(input: PartialDTO<T>, options?: SqbEntityService.CreateOptions): Promise<PartialDTO<T>> {
    const encode = this.getEncoder('create');
    const data: any = encode(input);
    const out = await this._dbCreate(data, options);
    if (out) return out;
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Returns the count of records based on the provided options
   *
   * @param {SqbEntityService.CountOptions} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of records
   * @protected
   */
  protected async _count(options?: SqbEntityService.CountOptions): Promise<number> {
    return this._dbCount(options);
  }

  /**
   * Deletes a record from the collection.
   *
   * @param {SQBAdapter.IdOrIds} id - The ID of the document to delete.
   * @param {SqbEntityService.DeleteOptions} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   * @protected
   */
  protected async _delete(id: SQBAdapter.IdOrIds, options?: SqbEntityService.DeleteOptions): Promise<number> {
    return this._dbDelete(id, options);
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {SqbEntityService.DeleteManyOptions} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   * @protected
   */
  protected async _deleteMany(options?: SqbEntityService.DeleteManyOptions): Promise<number> {
    return await this._dbDeleteMany(options);
  }

  /**
   * Checks if a record with the given id exists.
   *
   * @param {SQBAdapter.IdOrIds} id - The id of the object to check.
   * @param {SqbEntityService.ExistsOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the record exists or not.
   * @protected
   */
  protected async _exists(id: SQBAdapter.IdOrIds, options?: SqbEntityService.ExistsOptions): Promise<boolean> {
    return await this._dbExists(id, options);
  }

  /**
   * Checks if a record with the given arguments exists.
   *
   * @param {SqbEntityService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the record exists or not.
   * @protected
   */
  protected async _existsOne(options?: SqbEntityService.ExistsOptions): Promise<boolean> {
    return await this._dbExistsOne(options);
  }

  /**
   * Finds a record by ID.
   *
   * @param {SQBAdapter.Id} id - The ID of the record.
   * @param {SqbEntityService.FindOneOptions} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   * @protected
   */
  protected async _findById(
    id: SQBAdapter.Id,
    options?: SqbEntityService.FindOneOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const decode = this.getDecoder();
    const out = await this._dbFindById(id, options);
    return out ? (decode(out) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds a record in the collection that matches the specified options.
   *
   * @param {SqbEntityService.FindOneOptions} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   * @protected
   */
  protected async _findOne(options?: SqbEntityService.FindOneOptions): Promise<PartialDTO<T> | undefined> {
    const decode = this.getDecoder();
    const out = await this._dbFindOne(options);
    return out ? (decode(out) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds multiple records in collection.
   *
   * @param {SqbEntityService.FindManyOptions} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   * @protected
   */
  protected async _findMany(options?: SqbEntityService.FindManyOptions): Promise<PartialDTO<T>[]> {
    const decode = this.getDecoder();
    const out: any[] = await this._dbFindMany(options);
    if (out?.length) {
      return out.map(x => decode(x)) as any;
    }
    return out;
  }

  /**
   * Updates a record with the given id in the collection.
   *
   * @param {SQBAdapter.IdOrIds} id - The id of the document to update.
   * @param {PatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {SqbEntityService.UpdateOptions} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   * @protected
   */
  protected async _update(
    id: SQBAdapter.IdOrIds,
    input: PatchDTO<T>,
    options?: SqbEntityService.UpdateOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const encode = this.getEncoder('update');
    const decode = this.getDecoder();
    const data: any = encode(input);
    const out = await this._dbUpdate(id, data, options);
    if (out) return decode(out);
  }

  /**
   * Updates a record in the collection with the specified ID and returns updated record count
   *
   * @param {any} id - The ID of the document to update.
   * @param {PatchDTO<T>} input - The partial input data to update the document with.
   * @param {SqbEntityService.UpdateOptions} options - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   * @protected
   */
  protected async _updateOnly(
    id: SQBAdapter.IdOrIds,
    input: PatchDTO<T>,
    options?: SqbEntityService.UpdateOptions,
  ): Promise<boolean> {
    const encode = this.getEncoder('create');
    const data: any = encode(input);
    return await this._dbUpdateOnly(id, data, options);
  }

  /**
   * Updates multiple records in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>} input - The partial input to update the documents with.
   * @param {SqbEntityService.UpdateManyOptions} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   * @protected
   */
  protected async _updateMany(input: PatchDTO<T>, options?: SqbEntityService.UpdateManyOptions): Promise<number> {
    const encode = this.getEncoder('update');
    const data: any = encode(input);
    return await this._dbUpdateMany(data, options);
  }

  /**
   * Acquires a connection and performs Repository.create operation
   *
   * @param input - The document to insert
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbCreate(input: PartialDTO<T>, options?: Repository.CreateOptions): Promise<PartialDTO<T>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    return await repo.create(input as any, options);
  }

  /**
   * Acquires a connection and performs Repository.count operation
   *
   * @param options - The options for counting documents.
   * @protected
   */
  protected async _dbCount(options?: Repository.CountOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.count(options);
  }

  /**
   * Acquires a connection and performs Repository.delete operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDelete(id: SQBAdapter.IdOrIds, options?: Repository.DeleteOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return (await repo.delete(id, options)) ? 1 : 0;
  }

  /**
   * Acquires a connection and performs Repository.deleteMany operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDeleteMany(options?: Repository.DeleteManyOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.deleteMany(options);
  }

  /**
   * Acquires a connection and performs Repository.exists operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbExists(id: SQBAdapter.IdOrIds, options?: Repository.ExistsOptions): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.exists(id, options);
  }

  /**
   * Acquires a connection and performs Repository.existsOne operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbExistsOne(options?: Repository.ExistsOptions): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.existsOne(options);
  }

  /**
   * Acquires a connection and performs Repository.findById operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindById(
    id: SQBAdapter.IdOrIds,
    options?: Repository.FindOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findById(id, options);
  }

  /**
   * Acquires a connection and performs Repository.findOne operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindOne(options?: Repository.FindOneOptions): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findOne(options);
  }

  /**
   * Acquires a connection and performs Repository.findMany operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindMany(options?: Repository.FindManyOptions): Promise<PartialDTO<T>[]> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findMany(options);
  }

  /**
   * Acquires a connection and performs Repository.update operation
   *
   * @param id - Value of the key field used to select the record
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdate(
    id: SQBAdapter.IdOrIds,
    data: PatchDTO<T>,
    options?: Repository.UpdateOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.update(id, data, options);
  }

  /**
   * Acquires a connection and performs Repository.updateOnly operation
   *
   * @param id - Value of the key field used to select the record
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateOnly(
    id: SQBAdapter.IdOrIds,
    data: PatchDTO<T>,
    options?: Repository.UpdateOptions,
  ): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.updateOnly(id, data, options);
  }

  /**
   * Acquires a connection and performs Repository.updateMany operation
   *
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateMany(data: PatchDTO<T>, options?: Repository.UpdateManyOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.updateMany(data as any, options);
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getConnection(): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient> {
    const db = typeof this.db === 'function' ? this.db(this) : this.db;
    if (!db) throw new Error(`Database not set!`);
    return db;
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getCommonFilter(args: {
    crud: SqbEntityService.CrudOp;
    method: string;
    byId: boolean;
    documentId?: SQBAdapter.IdOrIds;
    input?: Object;
    options?: Record<string, any>;
  }): SQBAdapter.FilterInput | Promise<SQBAdapter.FilterInput> | undefined {
    return typeof this.$commonFilter === 'function' ? this.$commonFilter(args, this) : this.$commonFilter;
  }

  protected async _intercept(
    callback: (...args: any[]) => any,
    args: {
      crud: SqbEntityService.CrudOp;
      method: string;
      byId: boolean;
      documentId?: any;
      input?: Object;
      options?: Record<string, any>;
    },
  ): Promise<any> {
    try {
      if (this.$interceptor) return this.$interceptor(callback, args, this);
      return callback();
    } catch (e: any) {
      Error.captureStackTrace(e, this._intercept);
      await this.$onError?.(e, this);
      throw e;
    }
  }
}
