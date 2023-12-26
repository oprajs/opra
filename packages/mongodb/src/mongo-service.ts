import mongodb, { MongoClient, TransactionOptions } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { IsObject } from 'valgen';
import { ComplexType, DataType, DATATYPE_METADATA, PartialDTO } from '@opra/common';
import { ApiService } from '@opra/core';
import { AnyId, WithTransactionCallback } from './types.js';


/**
 * Class representing a MongoDB service for interacting with a collection.
 * @extends ApiService
 * @template T - The type of the documents in the collection.
 */
export class MongoService<T extends mongodb.Document> extends ApiService {
  protected _encoders: Record<string, IsObject.Validator<T>> = {};
  protected _decoder?: IsObject.Validator<T>;
  protected _dataType: Type | string;

  /**
   * Represents the name of a collection in MongoDB
   */
  collectionName?: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   * @type {string}
   */
  resourceName?: string | ((_this: any) => string);

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
   * @protected
   */
  $idGenerator?: (_this: any) => AnyId;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param _this - The context object.
   */
  $onError?: (error: unknown, _this: any) => void | Promise<void>;


  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the array elements.
   * @param [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoService.Options) {
    super();
    this._dataType = dataType;
    this.db = options?.db;
    this.collectionName = options?.collectionName;
    if (!this.collectionName) {
      if (typeof dataType === 'string')
        this.collectionName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata)
          this.collectionName = metadata.name;
      }
    }
    this.resourceName = options?.resourceName;
    this.$idGenerator = options?.idGenerator;
  }

  /**
   * Retrieves the data type of the document
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  getDataType(): ComplexType {
    return this.context.api.getComplexType(this._dataType);
  }

  /**
   * Retrieves the encoder for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  getEncoder(operation: 'create' | 'update'): IsObject.Validator<T> {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    encoder = this._generateEncoder(operation);
    this._encoders[operation] = encoder;
    return encoder;
  }

  /**
   * Retrieves the decoder.
   */
  getDecoder(): IsObject.Validator<T> {
    let decoder = this._decoder;
    if (decoder)
      return decoder;
    decoder = this._generateDecoder();
    this._decoder = decoder;
    return decoder;
  }

  /**
   * Executes the provided function within a transaction.
   *
   * @param callback - The function to be executed within the transaction.
   * @param [options] - Optional options for the transaction.
   */
  async withTransaction(callback: WithTransactionCallback, options?: TransactionOptions): Promise<any> {
    let session = this.getSession();
    if (session)
      return callback(session);

    // Backup old session property
    const hasOldSession = this.hasOwnProperty('session');
    const oldSessionGetter = hasOldSession ? this.session : undefined;

    const db = this.getDatabase();
    const client = (db as any).client as MongoClient;
    session = client.startSession();
    this.session = session;
    const oldInTransaction = session.inTransaction();
    try {
      if (!oldInTransaction)
        session.startTransaction(options);
      const out = await callback(session);
      if (!oldInTransaction)
        await session.commitTransaction();
      return out;
    } catch (e) {
      if (!oldInTransaction)
        await session.abortTransaction();
      throw e;
    } finally {
      // Restore old session property
      if (hasOldSession)
        this.session = oldSessionGetter;
      else delete this.session;
      if (!oldInTransaction)
        await session.endSession();
    }
  }

  /**
   * Inserts a single document into MongoDB. If documents passed in do not contain the **_id** field,
   * one will be added to each of the documents missing it by the driver, mutating the document. This behavior
   * can be overridden by setting the **forceServerObjectId** flag.
   *
   * @param doc - The document to insert
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __insertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.insertOne(doc, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param filter - The filter used to match documents.
   * @param options - The options for counting documents.
   * @protected
   */
  protected async __countDocuments(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: undefined,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.countDocuments(filter || {}, options) || 0;
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Delete a document from a collection
   *
   * @param filter - The filter used to select the document to remove
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __deleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.deleteOne(filter || {}, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Delete multiple documents from a collection
   *
   * @param filter - The filter used to select the documents to remove
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __deleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.deleteMany(filter || {}, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param field - Field of the document to find distinct values for
   * @param filter - The filter for filtering the set of documents to which we apply the distinct filter.
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __distinct(field: string, filter?: mongodb.Filter<T>, options?: mongodb.DistinctOptions): Promise<any[]> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.distinct(field, filter || {}, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Execute an aggregation framework pipeline against the collection, needs MongoDB \>= 2.2
   *
   * @param pipeline - An array of aggregation pipelines to execute
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __aggregate(pipeline?: mongodb.Document[], options?: mongodb.AggregateOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.aggregate<T>(pipeline, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Fetches the first document that matches the filter
   *
   * @param filter - Query for find Operation
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __findOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialDTO<T> | undefined> {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return await collection.findOne<T>(filter || {}, options) as PartialDTO<T>;
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Creates a cursor for a filter that can be used to iterate over results from MongoDB
   *
   * @param filter - The filter predicate. If unspecified,
   * then all documents in the collection will match the predicate
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __find(filter: mongodb.Filter<T>, options?: mongodb.FindOptions) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession()
    }
    try {
      return collection.find<T>(filter || {}, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Update a single document in a collection
   *
   * @param filter - The filter used to select the document to update
   * @param update - The update operations to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __updateOne(
      filter: mongodb.Filter<T>,
      update: mongodb.UpdateFilter<T>,
      options?: mongodb.UpdateOptions
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
    }
    try {
      return collection.updateOne(filter || {}, update, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation.
   *
   * @param filter - The filter used to select the document to update
   * @param update - Update operations to be performed on the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __findOneAndUpdate(
      filter: mongodb.Filter<T>,
      update: mongodb.UpdateFilter<T>,
      options?: mongodb.FindOneAndUpdateOptions
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const opts: mongodb.FindOneAndUpdateOptions = {
      returnDocument: 'after',
      includeResultMetadata: false,
      ...options,
      session: options?.session || this.getSession(),
    }
    try {
      return await collection.findOneAndUpdate(filter || {}, update, opts);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Update multiple documents in a collection
   *
   * @param filter - The filter used to select the documents to update
   * @param update - The update operations to be applied to the documents
   * @param options - Optional settings for the command
   * @protected
   */
  protected async __updateMany(
      filter: mongodb.Filter<T>,
      update: mongodb.UpdateFilter<T> | Partial<T>,
      options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>
  ) {
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.getSession(),
      upsert: false
    } as mongodb.UpdateOptions;
    try {
      return await collection.updateMany(filter || {}, update, options);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getDatabase(): mongodb.Db {
    const db = typeof this.db === 'function'
        ? this.db(this)
        : this.db
    if (!db)
      throw new Error(`Database not set!`);
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
    return typeof this.session === 'function'
        ? this.session(this)
        : this.session
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
   * Retrieves the collection name.
   *
   * @protected
   * @returns The collection name.
   * @throws {Error} If the collection name is not defined.
   */
  getCollectionName(): string {
    const out = typeof this.collectionName === 'function'
        ? this.collectionName(this)
        : this.collectionName;
    if (out)
      return out;
    throw new Error('collectionName is not defined');
  }

  /**
   * Retrieves the resource name.
   *
   * @protected
   * @returns {string} The resource name.
   * @throws {Error} If the collection name is not defined.
   */
  getResourceName(): string {
    const out = typeof this.resourceName === 'function'
        ? this.resourceName(this)
        : this.resourceName || this.getCollectionName();
    if (out)
      return out;
    throw new Error('resourceName is not defined');
  }

  /**
   * Generates an encoder for the specified operation.
   *
   * @param operation - The operation to generate the encoder for. Must be either 'create' or 'update'.
   * @protected
   * @returns - The generated encoder for the specified operation.
   */
  protected _generateEncoder(operation: 'create' | 'update'): IsObject.Validator<T> {
    const dataType = this.getDataType();
    const options: DataType.GenerateCodecOptions = {};
    if (operation === 'update') {
      options.omit = ['_id'];
      options.partial = true;
    }
    return dataType.generateCodec('encode', options);
  }


  /**
   * Generates an encoder for the specified operation.
   *
   * @protected
   * @returns - The generated encoder for the specified operation.
   */
  protected _generateDecoder(): IsObject.Validator<T> {
    const dataType = this.getDataType();
    return dataType.generateCodec('decode', {partial: true});
  }

}

/**
 * The namespace for the MongoService.
 *
 * @namespace MongoService
 */
export namespace MongoService {
  export interface Options {
    db?: MongoService<any>['db'];
    collectionName?: MongoService<any>['collectionName'];
    resourceName?: MongoService<any>['resourceName'];
    session?: MongoService<any>['session'];
    idGenerator?: MongoService<any>['$idGenerator'];
    onError?: MongoService<any>['$onError'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';


}

