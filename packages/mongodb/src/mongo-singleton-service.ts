import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { DTO, PartialDTO, PatchDTO, ResourceNotFoundError } from '@opra/common';
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
   * @type {FilterInput | MongoCollectionService.CommonFilterFunction}
   */
  documentFilter?: FilterInput | MongoSingletonService.CommonFilterFunction;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoSingletonService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoSingletonService.Options) {
    super(dataType, options);
    this.collectionKey = options?.collectionKey || '_id';
    this._id = options?._id || new ObjectId('655608925cad472b75fc6485');
    this.documentFilter = options?.documentFilter;
  }

  /**
   * Asserts the existence of a resource based on the given options.
   *
   * @returns {Promise<void>} A Promise that resolves when the resource exists.
   * @throws {ResourceNotFoundError} If the resource does not exist.
   */
  async assert(options?: MongoSingletonService.ExistsOptions): Promise<void> {
    if (!(await this.exists(options)))
      throw new ResourceNotFoundError(this.resourceName || this.getCollectionName());
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
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.create(input, {...options, __interceptor__: true} as Object),
          {
            crud: 'create',
            method: 'create',
            input,
            options,
          }
      );
    const encode = this.getEncoder('create');
    const doc: any = encode(input);
    doc._id = this._id;
    const r = await this.__insertOne(doc, options);
    if (r.insertedId) {
      if (!options)
        return doc;
      try {
        return this.get(options);
      } catch (e: any) {
        Error.captureStackTrace(e);
        throw e;
      }
    }
    /* istanbul ignore next */
    throw new Error('Unknown error while creating document');
  }

  /**
   * Deletes a record from the database
   *
   * @param {MongoSingletonService.DeleteOptions<T>} options - The options for deleting the record
   * @returns {Promise<number>} The number of records deleted
   */
  async delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.delete({...options, __interceptor__: true} as Object),
          {
            crud: 'delete',
            method: 'delete',
            options,
          }
      );
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
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.exists({...options, __interceptor__: true} as Object),
          {
            crud: 'read',
            method: 'exists',
            options,
          }
      );
    return !!(await this.findOne({...options, pick: ['_id']}));
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
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.findOne({...options, __interceptor__: true} as Object),
          {
            crud: 'read',
            method: 'find',
            options,
          }
      );
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
      throw new ResourceNotFoundError(this.resourceName || this.getCollectionName());
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
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.updateOnly(input, {...options, __interceptor__: true} as Object),
          {
            crud: 'update',
            method: 'update',
            input,
            options,
          }
      );
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
    if (this.interceptor && !(options as any)?.__interceptor__)
      return this.interceptor(
          () => this.update(input, {...options, __interceptor__: true} as Object),
          {
            crud: 'update',
            method: 'update',
            input,
            options,
          }
      );
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
    return typeof this.documentFilter === 'function'
        ? this.documentFilter(this) : this.documentFilter;
  }

}

/**
 *
 * @namespace MongoSingletonService
 */
export namespace MongoSingletonService {

  export type CommonFilterFunction =
      (_this: MongoSingletonService<any>) => FilterInput | undefined;


  /**
   * The constructor options of MongoSingletonService.
   *
   * @interface Options
   * @extends MongoService.Options
   */
  export interface Options extends MongoService.Options {
    collectionKey?: string;
    _id?: AnyId;
    documentFilter?: CommonFilterFunction;
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
