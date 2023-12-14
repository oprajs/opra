import mongodb from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import vg from 'valgen';
import { ComplexType, DataType, DATATYPE_METADATA, PartialDTO } from '@opra/common';
import { ApiService, RequestContext } from '@opra/core';
import { AnyId } from './types.js';


/**
 * Class representing a MongoDB service for interacting with a collection.
 * @extends ApiService
 * @template T - The type of the documents in the collection.
 */
export class MongoService<T extends mongodb.Document> extends ApiService {
  protected _encoders: Record<string, vg.ObjectValidator<T>> = {};
  protected _decoder?: vg.ObjectValidator<T>;
  protected _dataType: Type | string;

  /**
   * Represents the name of a collection in MongoDB
   *
   * @type {string | Function} collectionName
   */
  collectionName?: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   *
   * @type {string}
   */
  resourceName?: string | ((_this: any) => string);

  /**
   * Represents a MongoDB database object.
   * @type {mongodb.Db | Function}
   */
  db?: mongodb.Db | ((_this: any) => mongodb.Db);

  /**
   * Represents a MongoDB ClientSession.
   *
   * @type {mongodb.ClientSession}
   */
  session?: mongodb.ClientSession | ((_this: any) => mongodb.ClientSession);

  /**
   * Generates a new id for new inserting Document.
   *
   * @protected
   * @returns {AnyId} A new instance of AnyId.
   */
  $idGenerator?: (_this: any) => AnyId;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param {object} _this - The context object.
   * @return {void|Promise<void>} - A void value or a promise that resolves to void.
   */
  $onError?: (error: unknown, _this: any) => void | Promise<void>;


  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoService.Options} [options] - The options for the array service.
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
   * @returns {ComplexType} The complex data type of the field.
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  getDataType(): ComplexType {
    return this.context.api.getComplexType(this._dataType);
  }

  /**
   * Retrieves the encoder for the specified operation.
   *
   * @param {String} operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   * @returns {vg.ObjectValidator<T>} - The encoder for the specified operation.
   */
  getEncoder(operation: 'create' | 'update'): vg.ObjectValidator<T> {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    encoder = this._generateEncoder(operation);
    this._encoders[operation] = encoder;
    return encoder;
  }

  /**
   * Retrieves the decoder.
   *
   * @returns {vg.ObjectValidator<T>} - The encoder for the specified operation.
   */
  getDecoder(): vg.ObjectValidator<T> {
    let decoder = this._decoder;
    if (decoder)
      return decoder;
    decoder = this._generateDecoder();
    this._decoder = decoder;
    return decoder;
  }

  /**
   * Inserts a single document into MongoDB. If documents passed in do not contain the **_id** field,
   * one will be added to each of the documents missing it by the driver, mutating the document. This behavior
   * can be overridden by setting the **forceServerObjectId** flag.
   *
   * @param {T} doc - The document to be inserted.
   * @param {mongodb.InsertOneOptions} options - The options for the insert operation.
   * @returns {Promise<mongodb.InsertOneWriteOpResult<mongodb.OptionalId<T>>>} - A promise that resolves with the result of the insert operation.
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
   * @param {mongodb.Filter<T>} filter - The filter used to match documents.
   * @param {mongodb.CountOptions} options - The options for counting documents.
   * @returns {Promise<number>} - The number of documents matching the filter.
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
   * @param {mongodb.Filter<T>} filter - The filter used to select the document to remove
   * @param {mongodb.DeleteOptions} options - Optional settings for the command
   * @return {Promise<mongodb.DeleteResult>} A Promise that resolves to the result of the delete operation
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
   * Deletes multiple documents from a collection.
   *
   * @param {mongodb.Filter<T>} [filter] - The filter object specifying the documents to delete.
   * If not provided, all documents in the collection will be deleted.
   * @param {mongodb.DeleteOptions} [options] - The options for the delete operation.
   * @returns {Promise<mongodb.DeleteResult>} A promise that resolves with the delete result object.
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
   * Create a new Change Stream, watching for new changes
   * (insertions, updates, replacements, deletions, and invalidations) in this collection.
   *
   * @param {mongodb.Document[]} pipeline - The pipeline of aggregation stages to apply to the collection.
   * @param {mongodb.AggregateOptions} options - The options to customize the aggregation.
   * @returns {Promise<mongodb.ChangeStream<T>>} - A promise that resolves to a Change Stream that represents the result of the aggregation.
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
   * @param {mongodb.Filter<T>} filter - The filter object to match documents against
   * @param {mongodb.FindOptions} [options] - The options to use when querying the collection
   * @protected
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the first matching document, or undefined if no match is found
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
   * Creates a cursor for a filter that can be used to iterate over results from MongoDB.
   *
   * @param {mongodb.Filter<T>} filter - The filter to apply when searching for results.
   * @param {mongodb.FindOptions} [options] - The options to customize the search behavior.
   * @returns {mongodb.Cursor<T>} - The cursor object that can be used to iterate over the results.
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
   * Update a single document in a collection.
   *
   * @param {mongodb.Filter<T>} filter - The filter to select the document(s) to update.
   * @param {mongodb.UpdateFilter<T>} update - The update operation to be applied on the selected document(s).
   * @param {mongodb.UpdateOptions} [options] - Optional settings for the update operation.
   * @protected
   * @returns {Promise<mongodb.UpdateResult>} - A promise that resolves to the result of the update operation.
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
   * @param {mongodb.Filter<T>} filter - The filter to select the document to be updated.
   * @param {mongodb.UpdateFilter<T>} doc - The update document.
   * @param {mongodb.FindOneAndUpdateOptions} [options] - Optional options for the find one and update operation.
   * @returns {Promise<T | null>} - A promise that resolves to the updated document or null if no document matched the filter.
   * @protected
   */
  protected async __findOneAndUpdate(
      filter: mongodb.Filter<T>,
      doc: mongodb.UpdateFilter<T>,
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
      return await collection.findOneAndUpdate(filter || {}, doc, opts);
    } catch (e: any) {
      await this.$onError?.(e, this);
      throw e;
    }
  }

  /**
   * Update multiple documents in a collection.
   *
   * @param {mongodb.Filter<T>} filter - The filter used to select the documents to be updated.
   * @param {mongodb.UpdateFilter<T> | Partial<T>} doc - The updates to be applied to the selected documents.
   * @param {StrictOmit<mongodb.UpdateOptions, 'upsert'>} [options] - The optional settings for the update operation.
   * @return {Promise<mongodb.UpdateResult>} - A Promise that resolves to the result of the update operation.
   * @protected
   */
  protected async __updateMany(
      filter: mongodb.Filter<T>,
      doc: mongodb.UpdateFilter<T> | Partial<T>,
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
      return await collection.updateMany(filter || {}, doc, options);
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
   * @returns {Promise<mongodb.Db>} The database connection.
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
   * @returns {Promise<mongodb.ClientSession>} The database connection.
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
   * @param {mongodb.Db} db - The MongoDB database.
   * @protected
   * @returns {Promise<mongodb.Collection<T>>} A promise that resolves to the MongoDB collection.
   */
  protected async getCollection(db: mongodb.Db): Promise<mongodb.Collection<T>> {
    return db.collection<T>(this.getCollectionName());
  }

  /**
   * Retrieves the collection name.
   *
   * @protected
   * @returns {string} The collection name.
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
   * @returns {string} The collection name.
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
   * Compares the current instance with the provided attributes and returns true if they match, false otherwise.
   * This method is protected and should only be called by subclasses.
   *
   * @param {MongoService<any>} service - The service instance to compare.
   * @param {RequestContext} context - The request context.
   * @param {Object} attributes - Optional attributes object for comparison.
   * @return {boolean} - True if the instance matches the provided attributes, false otherwise.
   * @protected
   */
  protected _instanceCompare(service: MongoService<any>, context: RequestContext, attributes?: any): boolean {
    return super._instanceCompare(service, context, attributes) &&
        (!attributes?.db ||
            (typeof service.db === 'object' && service.db === attributes.db) ||
            (typeof service.db === 'function' && service.getDatabase() === attributes.db)
        ) &&
        (!attributes?.session ||
            (typeof service.session === 'object' && service.session === attributes?.session) ||
            (typeof service.session === 'function' && service.getSession() === attributes?.session)
        );
  }

  /**
   * Generates an encoder for the specified operation.
   *
   * @param {string} operation - The operation to generate the encoder for. Must be either 'create' or 'update'.
   * @protected
   * @returns {vg.Validator} - The generated encoder for the specified operation.
   */
  protected _generateEncoder(operation: 'create' | 'update'): vg.ObjectValidator<T> {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    const dataType = this.getDataType();
    const options: DataType.GenerateCodecOptions = {};
    if (operation === 'update') {
      options.omit = ['_id'];
      options.partial = true;
    }
    encoder = dataType.generateCodec('encode', options);
    this._encoders[operation] = encoder;
    return encoder;
  }


  /**
   * Generates an encoder for the specified operation.
   *
   * @protected
   * @returns {vg.Validator} - The generated encoder for the specified operation.
   */
  protected _generateDecoder(): vg.ObjectValidator<T> {
    let decoder = this._decoder;
    if (decoder)
      return decoder;
    const dataType = this.getDataType();
    decoder = this._decoder = dataType.generateCodec('decode', {partial: true});
    return decoder;
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
