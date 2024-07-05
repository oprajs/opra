import * as OpraCommon from '@opra/common';
import { ComplexType, DataType, DATATYPE_METADATA } from '@opra/common';
import { ServiceBase } from '@opra/core';
import mongodb, { Document, MongoClient, ObjectId, TransactionOptions } from 'mongodb';
import { PartialDTO, StrictOmit, Type } from 'ts-gems';
import { IsObject } from 'valgen';
import { MongoAdapter } from './mongo-adapter.js';

/**
 * The namespace for the MongoService.
 *
 * @namespace MongoService
 */
export namespace MongoService {
  export interface Options {
    db?: MongoService<any>['db'];
    session?: MongoService<any>['session'];
    collectionName?: MongoService<any>['$collectionName'];
    resourceName?: MongoService<any>['$resourceName'];
    documentFilter?: MongoService<any>['$documentFilter'];
    interceptor?: MongoService<any>['$interceptor'];
    idGenerator?: MongoService<any>['$idGenerator'];
    onError?: MongoService<any>['$onError'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';

  export interface CommandInfo {
    crud: CrudOp;
    method: string;
    byId: boolean;
    documentId?: MongoAdapter.AnyId;
    nestedId?: MongoAdapter.AnyId;
    input?: Record<string, any>;
    options?: Record<string, any>;
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends mongodb.InsertOneOptions {
    projection?: string[];
  }

  /**
   * Represents options for "count" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface CountOptions<T> extends mongodb.CountOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "delete" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteManyOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "distinct" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DistinctOptions<T> extends mongodb.DistinctOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions<T> extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for checking the document exists
   *
   * @interface
   */
  export interface ExistsOneOptions<T> extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOneOptions<T> extends StrictOmit<FindManyOptions<T>, 'limit'> {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindManyOptions<T> extends mongodb.AggregateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
    projection?: string | string[] | Document;
    sort?: string[];
    limit?: number;
    skip?: number;
  }

  /**
   * Represents options for "update" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOptions<T>
    extends StrictOmit<mongodb.FindOneAndUpdateOptions, 'projection' | 'returnDocument' | 'includeResultMetadata'> {
    projection?: string | string[] | Document;
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateManyOptions<T> extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }
}

/**
 * Class representing a MongoDB service for interacting with a collection.
 * @extends ServiceBase
 * @template T - The type of the documents in the collection.
 */
export class MongoService<T extends mongodb.Document = mongodb.Document> extends ServiceBase {
  protected _dataType_: Type | string;
  protected _dataType: ComplexType;
  protected _inputCodecs: Record<string, IsObject.Validator<T>> = {};
  protected _outputCodecs: Record<string, IsObject.Validator<T>> = {};

  /**
   * Represents the name of a collection in MongoDB
   */
  $collectionName?: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   * @type {string}
   */
  $resourceName?: string | ((_this: any) => string);

  /**
   * Represents a MongoDB database object.
   */
  db?: mongodb.Db | ((_this: any) => mongodb.Db);

  /**
   * Represents a MongoDB ClientSession.
   */
  session?: mongodb.ClientSession | ((_this: any) => mongodb.ClientSession);

  /**
   * Generates a new id for new inserting Document.
   *
   */
  $idGenerator?: (_this: any) => MongoAdapter.AnyId;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param _this - The context object.
   */
  $onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Represents a common filter function for a MongoService.
   *
   * @type {FilterInput | Function}
   */
  $documentFilter?:
    | MongoAdapter.FilterInput
    | ((
        args: MongoService.CommandInfo,
        _this: this,
      ) => MongoAdapter.FilterInput | Promise<MongoAdapter.FilterInput> | undefined);

  /**
   * Interceptor function for handling callback execution with provided arguments.
   *
   * @param callback - The callback function to be intercepted.
   * @param {MongoService.CommandInfo} info - The arguments object containing the following properties:
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  $interceptor?: (callback: () => any, info: MongoService.CommandInfo, _this: any) => Promise<any>;

  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the returning results
   * @param [options] - The options for the service
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoService.Options) {
    super();
    this._dataType_ = dataType;
    this.db = options?.db;
    this.$documentFilter = this.$documentFilter || options?.documentFilter;
    this.$interceptor = this.$interceptor || options?.interceptor;
    this.$collectionName = options?.collectionName;
    if (!this.$collectionName) {
      if (typeof dataType === 'string') this.$collectionName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata) this.$collectionName = metadata.name;
      }
    }
    this.$resourceName = options?.resourceName;
    this.$idGenerator = options?.idGenerator;
  }

  /**
   * Retrieves the collection name.
   *
   * @protected
   * @returns The collection name.
   * @throws {Error} If the collection name is not defined.
   */
  getCollectionName(): string {
    const out = typeof this.$collectionName === 'function' ? this.$collectionName(this) : this.$collectionName;
    if (out) return out;
    throw new Error('collectionName is not defined');
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
      typeof this.$resourceName === 'function'
        ? this.$resourceName(this)
        : this.$resourceName || this.getCollectionName();
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
   * Executes the provided function within a transaction.
   *
   * @param callback - The function to be executed within the transaction.
   * @param [options] - Optional options for the transaction.
   */
  async withTransaction(callback: MongoAdapter.WithTransactionCallback, options?: TransactionOptions): Promise<any> {
    let session = this.getSession();
    if (session) return callback(session);

    // Backup old session property
    const hasOldSession = Object.prototype.hasOwnProperty.call(this, 'session');
    const oldSessionGetter = hasOldSession ? this.session : undefined;

    const db = this.getDatabase();
    const client = (db as any).client as MongoClient;
    session = client.startSession();
    this.session = session;
    const oldInTransaction = session.inTransaction();
    try {
      if (!oldInTransaction) session.startTransaction(options);
      const out = await callback(session);
      if (!oldInTransaction) await session.commitTransaction();
      return out;
    } catch (e) {
      if (!oldInTransaction) await session.abortTransaction();
      throw e;
    } finally {
      // Restore old session property
      if (hasOldSession) this.session = oldSessionGetter;
      else delete this.session;
      if (!oldInTransaction) await session.endSession();
    }
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param filter - The filter used to match documents.
   * @param options - The options for counting documents.
   * @protected
   */
  protected async _dbCountDocuments(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: undefined,
      session: options?.session || this.getSession(),
    };
    return (await collection.countDocuments(filter || {}, options)) || 0;
  }

  /**
   * Acquires a connection and performs Collection.deleteOne operation
   *
   * @param filter - The filter used to select the document to remove
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDeleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.deleteOne(filter || {}, options);
  }

  /**
   * Acquires a connection and performs Collection.deleteMany operation
   *
   * @param filter - The filter used to select the documents to remove
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDeleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.deleteMany(filter || {}, options);
  }

  /**
   * Acquires a connection and performs Collection.distinct operation
   *
   * @param field - Field of the document to find distinct values for
   * @param filter - The filter for filtering the set of documents to which we apply the distinct filter.
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDistinct(
    field: string,
    filter?: mongodb.Filter<T>,
    options?: mongodb.DistinctOptions,
  ): Promise<any[]> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.distinct(field, filter || {}, options);
  }

  /**
   * Acquires a connection and performs Collection.aggregate operation
   *
   * @param pipeline - An array of aggregation pipelines to execute
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbAggregate(pipeline?: mongodb.Document[], options?: mongodb.AggregateOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.aggregate<T>(pipeline, options);
  }

  /**
   * Acquires a connection and performs Collection.findOne operation
   *
   * @param filter - Query for find Operation
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindOne(
    filter: mongodb.Filter<T>,
    options?: mongodb.FindOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return (await collection.findOne<T>(filter || {}, options)) as PartialDTO<T>;
  }

  /**
   * Acquires a connection and performs Collection.find operation
   *
   * @param filter - The filter predicate. If unspecified,
   * then all documents in the collection will match the predicate
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFind(filter: mongodb.Filter<T>, options?: mongodb.FindOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return collection.find<T>(filter || {}, options);
  }

  /**
   * Acquires a connection and performs Collection.insertOne operation
   *
   * @param doc - The document to insert
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbInsertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.insertOne(doc, options);
  }

  /**
   * Acquires a connection and performs Collection.updateOne operation
   *
   * @param filter - The filter used to select the document to update
   * @param update - The update operations to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateOne(
    filter: mongodb.Filter<T>,
    update: mongodb.UpdateFilter<T>,
    options?: mongodb.UpdateOptions,
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    };
    return collection.updateOne(filter || {}, update, options);
  }

  /**
   * Acquires a connection and performs Collection.findOneAndUpdate operation
   *
   * @param filter - The filter used to select the document to update
   * @param update - Update operations to be performed on the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindOneAndUpdate(
    filter: mongodb.Filter<T>,
    update: mongodb.UpdateFilter<T>,
    options?: mongodb.FindOneAndUpdateOptions,
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const opts: mongodb.FindOneAndUpdateOptions = {
      returnDocument: 'after',
      includeResultMetadata: false,
      ...options,
      session: options?.session || this.getSession(),
    };
    return await collection.findOneAndUpdate(filter || {}, update, opts);
  }

  /**
   * Acquires a connection and performs Collection.updateMany operation
   *
   * @param filter - The filter used to select the documents to update
   * @param update - The update operations to be applied to the documents
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateMany(
    filter: mongodb.Filter<T>,
    update: mongodb.UpdateFilter<T> | Partial<T>,
    options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>,
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
      upsert: false,
    } as mongodb.UpdateOptions;
    return await collection.updateMany(filter || {}, update, options);
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getDatabase(): mongodb.Db {
    const db = typeof this.db === 'function' ? this.db(this) : this.db;
    if (!db) throw new Error(`Database not set!`);
    return db;
  }

  /**
   * Retrieves the database session.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getSession(): mongodb.ClientSession | undefined {
    return typeof this.session === 'function' ? this.session(this) : this.session;
  }

  /**
   * Retrieves a MongoDB collection from the given database.
   *
   * @param db - The MongoDB database.
   * @protected
   */
  protected async getCollection(db: mongodb.Db): Promise<mongodb.Collection<T>> {
    return db.collection<T>(this.getCollectionName());
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns {MongoAdapter.AnyId} The generated ID.
   */
  protected _generateId(): MongoAdapter.AnyId {
    return typeof this.$idGenerator === 'function' ? this.$idGenerator(this) : new ObjectId();
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getDocumentFilter(
    info: MongoService.CommandInfo,
  ): MongoAdapter.FilterInput | Promise<MongoAdapter.FilterInput> | undefined {
    return typeof this.$documentFilter === 'function' ? this.$documentFilter(info, this) : this.$documentFilter;
  }

  protected async _intercept(callback: (...args: any[]) => any, info: MongoService.CommandInfo): Promise<any> {
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
