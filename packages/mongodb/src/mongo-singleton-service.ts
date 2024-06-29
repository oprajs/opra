import { ResourceNotAvailableError } from '@opra/common';
import mongodb, { ObjectId } from 'mongodb';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';
import { MongoService } from './mongo-service.js';

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
  export interface Options extends MongoEntityService.Options {
    _id?: MongoAdapter.AnyId;
  }

  export interface CreateOptions extends MongoEntityService.CreateOptions {}

  export interface DeleteOptions<T> extends MongoEntityService.DeleteOptions<T> {}

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface FindOneOptions<T> extends MongoEntityService.FindOneOptions<T> {}

  export interface UpdateOptions<T> extends MongoEntityService.UpdateOptions<T> {}
}

/**
 * A class that provides access to a MongoDB collection, with support for singleton document operations.
 * @class MongoSingletonService
 * @extends MongoService
 * @template T - The type of document stored in the collection
 */
export class MongoSingletonService<T extends mongodb.Document> extends MongoEntityService<T> {
  /**
   * Represents a unique identifier for singleton record
   * @type {MongoAdapter.AnyId} _id
   */
  _id: MongoAdapter.AnyId;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoSingletonService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoSingletonService.Options) {
    super(dataType, options);
    this._id = this._id || options?._id || new ObjectId('655608925cad472b75fc6485');
  }

  /**
   * Asserts the existence of a resource based on the given options.
   *
   * @param {MongoSingletonService.ExistsOptions<T>} [options]
   * @returns {Promise<void>} A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} If the resource does not exist.
   */
  async assert(options?: MongoSingletonService.ExistsOptions<T>): Promise<void> {
    if (!(await this.exists(options))) throw new ResourceNotAvailableError(this.getResourceName());
  }

  /**
   * Creates the document in the database.
   *
   * @param {PartialDTO<T>} input - The partial input to create the document with.
   * @param {MongoSingletonService.CreateOptions} [options] - The options for creating the document.
   * @return {Promise<PartialDTO<T>>} A promise that resolves to the partial output of the created document.
   * @throws {Error} Throws an error if an unknown error occurs while creating the document.
   */
  async create(input: PartialDTO<T>, options?: MongoSingletonService.CreateOptions): Promise<PartialDTO<T>> {
    (input as any)._id = this._id;
    const info: MongoService.CommandInfo = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId: this._id,
      input,
      options,
    };
    return this._intercept(() => this._create(input, options), info);
  }

  /**
   * Deletes a record from the database
   *
   * @param {MongoSingletonService.DeleteOptions<T>} options - The options for deleting the record
   * @returns {Promise<number>} The number of records deleted
   */
  async delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: this._id,
      options,
    };
    return this._intercept(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._delete(this._id, { ...options, filter });
    }, info);
  }

  /**
   * Checks if the document exists in the database.
   *
   * @return {Promise<boolean>} - A promise that resolves to a boolean value indicating if the document exists.
   */
  async exists(options?: MongoSingletonService.ExistsOptions<T>): Promise<boolean> {
    return !!(await this.find({ ...options, projection: ['_id'], skip: undefined }));
  }

  /**
   * Fetches the document if it exists. Returns undefined if not found.
   *
   * @param {MongoSingletonService.FindOneOptions<T>} [options] - The options for finding the document.
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async find(options?: MongoSingletonService.FindOneOptions<T>): Promise<PartialDTO<T> | undefined> {
    const info: MongoService.CommandInfo = {
      crud: 'read',
      method: 'findOne',
      byId: true,
      documentId: this._id,
      options,
    };
    return this._intercept(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findById(this._id, { ...options, filter });
    }, info);
  }

  /**
   * Fetches the document from the Mongo collection service. Throws error if not found.
   *
   * @param {MongoSingletonService.FindOneOptions<T>} options - The options to customize the query.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves to the fetched document.
   * @throws {ResourceNotAvailableError} - If the document is not found in the collection.
   */
  async get(options?: MongoSingletonService.FindOneOptions<T>): Promise<PartialDTO<T>> {
    const out = await this.find(options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName());
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
  async updateOnly(input: PatchDTO<T>, options?: MongoSingletonService.UpdateOptions<T>): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'update',
      method: 'update',
      byId: true,
      documentId: this._id,
      input,
      options,
    };
    return this._intercept(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._updateOnly(this._id, input, { ...options, filter });
    }, info);
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
    options?: MongoSingletonService.UpdateOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: MongoService.CommandInfo = {
      crud: 'update',
      method: 'update',
      byId: true,
      documentId: this._id,
      input,
      options,
    };
    return this._intercept(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._update(this._id, input, { ...options, filter });
    }, info);
  }
}
