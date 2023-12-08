import mongodb from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import vg from 'valgen';
import { ComplexType, DataType, DATATYPE_METADATA } from '@opra/common';
import { ApiService, PartialOutput, RequestContext } from '@opra/core';

export namespace MongoService {
  export interface Options {
    db?: mongodb.Db;
    collectionName?: string;
    resourceName?: string;
  }
}

/**
 * Class representing a MongoDB service for interacting with a collection.
 * @extends ApiService
 * @template T - The type of the documents in the collection.
 */
export class MongoService<T extends mongodb.Document> extends ApiService {
  protected _encoders: Record<string, vg.ObjectValidator<T>> = {};
  protected _decoder?: vg.ObjectValidator<T>;
  protected _dataType: Type | string;
  collectionName?: string;
  db?: mongodb.Db;
  session?: mongodb.ClientSession;
  resourceName?: string;

  constructor(dataType: Type | string, options?: MongoService.Options) {
    super();
    this._dataType = dataType;
    this.db = options?.db;
    this.collectionName = options?.collectionName || options?.resourceName;
    if (!this.collectionName) {
      if (typeof dataType === 'string')
        this.collectionName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata)
          this.collectionName = metadata.name;
      }
    }
    this.resourceName = options?.resourceName || this.collectionName;
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
   * Creates a new instance for given context
   *
   * @param source
   */
  forContext(source: ApiService): this
  forContext(context: RequestContext, attributes?: { db?: mongodb.Db, session?: mongodb.ClientSession }): this
  forContext(arg0: any, attributes?: any): this {
    return super.forContext(arg0, attributes) as this;
  }

  /**
   * Inserts a single document into MongoDB. If documents passed in do not contain the **_id** field,
   * one will be added to each of the documents missing it by the driver, mutating the document. This behavior
   * can be overridden by setting the **forceServerObjectId** flag.
   *
   * @param doc
   * @param options
   * @protected
   */
  protected async __insertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.insertOne(doc, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param filter
   * @param options
   * @protected
   */
  protected async __countDocuments(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: undefined,
      session: options?.session || this.session
    }
    try {
      return await collection.countDocuments(filter, options) || 0;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Delete a document from a collection
   *
   * @param filter - The filter used to select the document to remove
   * @param options - Optional settings for the command
   */
  protected async __deleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.deleteOne(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Delete multiple documents from a collection
   *
   * @param filter
   * @param options
   * @protected
   */
  protected async __deleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.deleteMany(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Create a new Change Stream, watching for new changes (insertions, updates, replacements, deletions, and invalidations) in this collection.
   *
   * @param pipeline
   * @param options
   * @protected
   */
  protected async __aggregate(pipeline?: mongodb.Document[], options?: mongodb.AggregateOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.aggregate<T>(pipeline, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Fetches the first document that matches the filter
   *
   * @param filter
   * @param options
   * @protected
   */
  protected async __findOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T> | undefined> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.findOne<T>(filter, options) as PartialOutput<T>;
    } catch (e: any) {
      await this._onError(e);
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
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return collection.find<T>(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Update a single document in a collection
   *
   * @param {mongodb.Filter<T>} filter - The filter to select the document(s) to update
   * @param {mongodb.UpdateFilter<T>} update - The update operation to be applied on the selected document(s)
   * @param {mongodb.UpdateOptions} [options] - Optional settings for the update operation
   * @protected
   * @returns {Promise<mongodb.UpdateResult>} A promise that resolves to the result of the update operation
   */
  protected async __updateOne(
      filter: mongodb.Filter<T>,
      update: mongodb.UpdateFilter<T>,
      options?: mongodb.UpdateOptions
  ) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      session: this.session,
      ...options
    }
    try {
      return collection.updateOne(filter, update, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation.
   *
   * @param filter
   * @param doc
   * @param options
   * @protected
   */
  protected async __findOneAndUpdate(
      filter: mongodb.Filter<T>,
      doc: mongodb.UpdateFilter<T>,
      options?: mongodb.FindOneAndUpdateOptions
  ) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    const opts: mongodb.FindOneAndUpdateOptions = {
      returnDocument: 'after',
      session: this.session,
      includeResultMetadata: false,
      ...options,
    }
    try {
      return await collection.findOneAndUpdate(filter, doc, opts);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  /**
   * Update multiple documents in a collection
   *
   * @param filter
   * @param doc
   * @param options
   * @protected
   */
  protected async __updateMany(
      filter: mongodb.Filter<T>,
      doc: mongodb.UpdateFilter<T> | Partial<T>,
      options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>
  ) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session,
      upsert: false
    } as mongodb.UpdateOptions;
    try {
      return await collection.updateMany(filter, doc, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _onError(error: unknown): Promise<void> {
    if (this.onError)
      await this.onError(error);
  }

  protected getDatabase(): mongodb.Db | Promise<mongodb.Db> {
    if (!this.context)
      throw new Error(`Context not set!`);
    if (!this.db)
      throw new Error(`Database not set!`);
    return this.db;
  }

  protected async getCollection(db: mongodb.Db): Promise<mongodb.Collection<T>> {
    return db.collection<T>(this.getCollectionName());
  }

  protected getCollectionName(): string {
    if (this.collectionName)
      return this.collectionName;
    throw new Error('collectionName is not defined');
  }

  protected _cacheMatch(service: MongoService<any>, context: RequestContext, attributes?: any): boolean {
    return super._cacheMatch(service, context, attributes) &&
        (!attributes?.db || service.db === attributes.db) &&
        (!attributes?.session || this.session === attributes?.session);
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
   * Generates an encoder for the specified operation.
   *
   * @param {string} operation - The operation to generate the encoder for. Must be either 'create' or 'update'.
   *
   * @protected
   *
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
   *
   * @returns {vg.Validator} - The generated encoder for the specified operation.
   */
  protected _generateDecoder(): vg.ObjectValidator<T> {
    let decoder = this._decoder;
    if (decoder)
      return decoder;
    const dataType = this.getDataType();
    const options: DataType.GenerateCodecOptions = {};
    decoder = this._decoder = dataType.generateCodec('decode', options);
    return decoder;
  }

  protected onError?(error: unknown): void | Promise<void>;

}
