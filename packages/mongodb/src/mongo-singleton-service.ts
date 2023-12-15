import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { DTO, InternalServerError, PartialDTO, PatchDTO, ResourceNotFoundError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { FilterInput } from './adapter-utils/prepare-filter.js';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoService } from './mongo-service.js';
import { AnyId } from './types.js';

/**
 * A class that provides access to a MongoDB collection, with support for singleton document operations.
 * @class MongoSingletonService
 * @extends MongoService
 * @template T - The type of document stored in the collection
 */
export class MongoSingletonService<T extends mongodb.Document> extends MongoService<T> {
  /**
   * Represents a unique identifier for singleton record
   * @type {AnyId} _id
   */
  _id: AnyId;

  /**
   * Represents the key for a collection.
   *
   * @type {string}
   */
  collectionKey: string;

  /**
   * Represents a common filter function for a MongoCollectionService.
   *
   * @type {FilterInput | Function}
   */
  $documentFilter?: FilterInput | ((_this: this) => FilterInput | Promise<FilterInput> | undefined);

  /**
   * Interceptor function for handling callback execution with provided arguments.
   *
   * @param {Function} callback - The callback function to be intercepted.
   * @param {Object} args - The arguments object containing the following properties:
   *   @param {string} crud - The CRUD operation type.
   *   @param {string} method - The method name.
   *   @param {AnyId} documentId - The document ID (optional).
   *   @param {Object} input - The input object (optional).
   *   @param {Object} options - Additional options (optional).
   * @param {Object} _this - The reference to the current object.
   * @returns {Promise<any>} - The promise that resolves to the result of the callback execution.
   */
  $interceptor?: (
      callback: (...args: any[]) => any,
      args: {
        crud: MongoService.CrudOp;
        method: string;
        documentId?: AnyId;
        input?: Object;
        options?: Record<string, any>
      }, _this: any
  ) => Promise<any>;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoSingletonService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoSingletonService.Options) {
    super(dataType, options);
    this.collectionKey = this.collectionKey || options?.collectionKey || '_id';
    this._id = this._id || options?._id || new ObjectId('655608925cad472b75fc6485');
    this.$documentFilter = this.$documentFilter || options?.documentFilter;
    this.$interceptor = this.$interceptor || options?.interceptor;
  }

  /**
   * Asserts the existence of a resource based on the given options.
   *
   * @returns {Promise<void>} A Promise that resolves when the resource exists.
   * @throws {ResourceNotFoundError} If the resource does not exist.
   */
  async assert(options?: MongoSingletonService.ExistsOptions): Promise<void> {
    if (!(await this.exists(options)))
      throw new ResourceNotFoundError(this.getResourceName());
  }

  /**
   * Creates the document in the database.
   *
   * @param {DTO<T>} input - The partial input to create the document with.
   * @param {MongoSingletonService.CreateOptions} [options] - The options for creating the document.
   * @return {Promise<PartialDTO<T>>} A promise that resolves to the partial output of the created document.
   * @throws {Error} Throws an error if an unknown error occurs while creating the document.
   */
  async create(
      input: DTO<T>,
      options?: MongoSingletonService.CreateOptions
  ): Promise<PartialDTO<T>> {
    return this._intercept(
        () => this._create(input, options),
        {
          crud: 'create',
          method: 'create',
          input,
          options,
        }
    );
  }

  protected async _create(
      input: DTO<T>,
      options?: MongoSingletonService.CreateOptions
  ): Promise<PartialDTO<T>> {
    const encode = this.getEncoder('create');
    const doc: any = encode(input);
    doc._id = this._id;
    const r = await this.__insertOne(doc, options);
    if (r.insertedId) {
      if (!options)
        return doc;
      const out = await this._findOne(options);
      if (out)
        return out;
      if (!out)
        throw new ResourceNotFoundError(this.getResourceName());
    }
    /* istanbul ignore next */
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Deletes a record from the database
   *
   * @param {MongoSingletonService.DeleteOptions<T>} options - The options for deleting the record
   * @returns {Promise<number>} The number of records deleted
   */
  async delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    return this._intercept(
        () => this._delete(options),
        {
          crud: 'delete',
          method: 'delete',
          options,
        }
    );
  }

  protected async _delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    const filter = MongoAdapter.prepareFilter([
      {_id: this._id},
      await this._getDocumentFilter(),
      options?.filter
    ]);
    const r = await this.__deleteOne(filter, options);
    return r.deletedCount;
  }

  /**
   * Checks if the document exists in the database.
   *
   * @return {Promise<boolean>} - A promise that resolves to a boolean value indicating if the document exists.
   */
  async exists(options?: MongoSingletonService.ExistsOptions): Promise<boolean> {
    return !!(await this.findOne({...options, pick: ['_id'], omit: undefined, include: undefined}));
  }

  /**
   * Fetches the document if it exists. Returns undefined if not found.
   *
   * @param {MongoSingletonService.FindOptions<T>} [options] - The options for finding the document.
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async findOne(
      options?: MongoSingletonService.FindOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    return this._intercept(
        () => this._findOne(options),
        {
          crud: 'read',
          method: 'find',
          options,
        }
    );
  }

  protected async _findOne(
      options?: MongoSingletonService.FindOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter([
      {_id: this._id},
      await this._getDocumentFilter(),
      options?.filter
    ]);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
      sort: undefined,
      skip: undefined,
      limit: undefined
    }
    const decoder = this.getDecoder();
    const out = await this.__findOne(filter, mongoOptions);
    return out ? decoder(out) as PartialDTO<T> : undefined;
  }

  /**
   * Fetches the document from the Mongo collection service. Throws error if not found.
   *
   * @param {MongoCollectionService.FindOneOptions} options - The options to customize the query.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves to the fetched document.
   * @throws {ResourceNotFoundError} - If the document is not found in the collection.
   */
  async get(options?: MongoSingletonService.FindOptions<T>): Promise<PartialDTO<T>> {
    const out = await this.findOne(options);
    if (!out)
      throw new ResourceNotFoundError(this.getResourceName());
    return out;
  }

  /**
   * Updates a document in the MongoDB collection.
   *
   * @param {PatchDTO<T>} input - The partial input to update the document.
   * @param {MongoSingletonService.UpdateOptions<T>} [options] - The update options.
   *
   * @return {Promise<number>} - A promise that resolves to the updated document or undefined if not found.
   */
  async updateOnly(
      input: PatchDTO<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<number> {
    return this._intercept(
        () => this._updateOnly(input, options),
        {
          crud: 'update',
          method: 'update',
          input,
          options,
        }
    );
  }

  protected async _updateOnly(
      input: PatchDTO<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<number> {
    const encode = this.getEncoder('update');
    const doc = encode(input);
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const filter = MongoAdapter.prepareFilter([
      {_id: this._id},
      await this._getDocumentFilter(),
      options?.filter
    ])
    const r = await this.__updateOne(filter, patch, mongoOptions);
    return r.modifiedCount;
  }

  /**
   * Updates a document in the MongoDB collection.
   *
   * @param {PatchDTO<T>} input - The partial input to update the document.
   * @param {MongoSingletonService.UpdateOptions<T>} [options] - The update options.
   *
   * @return {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the updated document or undefined if not found.
   */
  async update(
      input: PatchDTO<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    return this._intercept(
        () => this._update(input, options),
        {
          crud: 'update',
          method: 'update',
          input,
          options,
        }
    );
  }

  protected async _update(
      input: PatchDTO<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    const encode = this.getEncoder('update');
    const doc = encode(input);
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const filter = MongoAdapter.prepareFilter([
      {_id: this._id},
      await this._getDocumentFilter(),
      options?.filter
    ])
    const decoder = this.getDecoder();
    const out = await this.__findOneAndUpdate(filter, patch, mongoOptions);
    return out ? decoder(out) as PartialDTO<T> : undefined;
  }

  /**
   * Retrieves the common filter used for querying the document.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getDocumentFilter(): FilterInput | Promise<FilterInput> | undefined {
    return typeof this.$documentFilter === 'function' ?
        this.$documentFilter(this) : this.$documentFilter;
  }

  protected async _intercept(
      callback: (...args: any[]) => any,
      args: {
        crud: MongoService.CrudOp;
        method: string;
        documentId?: AnyId;
        input?: Object;
        options?: Record<string, any>
      }
  ): Promise<any> {
    if (this.$interceptor)
      return this.$interceptor(callback, args, this);
    return callback();
  }

}

/**
 *
 * @namespace MongoSingletonService
 */
export namespace MongoSingletonService {


  /**
   * The constructor options of MongoSingletonService.
   *
   * @interface Options
   * @extends MongoService.Options
   */
  export interface Options extends MongoService.Options {
    collectionKey?: MongoSingletonService<any>['collectionKey'];
    _id?: MongoSingletonService<any>['_id'];
    documentFilter?: MongoSingletonService<any>['$documentFilter'];
    interceptor?: MongoSingletonService<any>['$interceptor'];
  }

  /**
   * Represents options for creating the document.
   *
   * @interface
   */
  export interface CreateOptions extends mongodb.InsertOneOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  /**
   * Represents options for deleting the document.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for finding the document.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOptions<T> extends StrictOmit<mongodb.FindOptions, 'sort' | 'limit' | 'skip'> {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for updating the document.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOptions<T> extends mongodb.FindOneAndUpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for checking the document exists
   *
   * @interface
   */
  export interface ExistsOptions extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
  }

}
