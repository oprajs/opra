import { ResourceNotAvailableError } from '@opra/common';
import mongodb, { UpdateFilter } from 'mongodb';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';
import { MongoService } from './mongo-service.js';

/**
 *
 * @namespace MongoCollectionService
 */
export namespace MongoCollectionService {
  /**
   * The constructor options of MongoCollectionService.
   *
   * @interface Options
   * @extends MongoService.Options
   */
  export interface Options extends MongoEntityService.Options {
    defaultLimit?: number;
  }

  export interface CreateOptions extends MongoEntityService.CreateOptions {}

  export interface CountOptions<T> extends MongoEntityService.CountOptions<T> {}

  export interface DeleteOptions<T> extends MongoEntityService.DeleteOptions<T> {}

  export interface DeleteManyOptions<T> extends MongoEntityService.DeleteManyOptions<T> {}

  export interface DistinctOptions<T> extends MongoEntityService.DistinctOptions<T> {}

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface ExistsOneOptions<T> extends MongoService.ExistsOneOptions<T> {}

  export interface FindOneOptions<T> extends MongoEntityService.FindOneOptions<T> {}

  export interface FindManyOptions<T> extends MongoEntityService.FindManyOptions<T> {}

  export interface UpdateOptions<T> extends MongoEntityService.UpdateOptions<T> {}

  export interface UpdateManyOptions<T> extends MongoEntityService.UpdateManyOptions<T> {}
}

/**
 * @class MongoCollectionService
 * @template T - The type of the documents in the collection.
 */
export class MongoCollectionService<T extends mongodb.Document> extends MongoEntityService<T> {
  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoCollectionService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoCollectionService.Options) {
    super(dataType, options);
    this.defaultLimit = this.defaultLimit || options?.defaultLimit || 10;
  }

  /**
   * Asserts the existence of a resource with the given ID.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the resource to assert.
   * @param {MongoCollectionService.ExistsOptions<T>} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: MongoAdapter.AnyId, options?: MongoCollectionService.ExistsOptions<T>): Promise<void> {
    if (!(await this.exists(id, options))) throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Creates a new document in the MongoDB collection.
   * Interceptors will be called before performing db operation
   *
   * @param {PartialDTO<T>} input - The input data for creating the document.
   * @param {MongoCollectionService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created document.
   * @throws {Error} if an unknown error occurs while creating the document.
   */
  async create(input: PartialDTO<T>, options?: MongoCollectionService.CreateOptions): Promise<PartialDTO<T>> {
    const id = (input as any)._id || this._generateId();
    if (id != null) (input as any)._id = id;
    const info: MongoService.CommandInfo = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId: id,
      input,
      options,
    };
    return this._executeCommand(() => this._create(input, options), info);
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoCollectionService.CountOptions<T>} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of documents in the collection.
   */
  async count(options?: MongoCollectionService.CountOptions<T>): Promise<number> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'count',
      byId: false,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._count({ ...options, filter });
    }, info);
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to delete.
   * @param {MongoCollectionService.DeleteOptions<T>} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(id: MongoAdapter.AnyId, options?: MongoCollectionService.DeleteOptions<T>): Promise<number> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._delete(id, { ...options, filter });
    }, info);
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoCollectionService.DeleteManyOptions<T>} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(options?: MongoCollectionService.DeleteManyOptions<T>): Promise<number> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._deleteMany({ ...options, filter });
    }, info);
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   * @param {string} field
   * @param {MongoCollectionService.DistinctOptions<T>} [options]
   * @protected
   */
  async distinct(field: string, options?: MongoCollectionService.DistinctOptions<T>): Promise<any[]> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'distinct',
      byId: true,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._distinct(field, { ...options, filter });
    }, info);
  }

  /**
   * Checks if an object with the given id exists.
   *
   * @param {MongoAdapter.AnyId} id - The id of the object to check.
   * @param {MongoCollectionService.ExistsOptions<T>} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async exists(id: MongoAdapter.AnyId, options?: MongoCollectionService.ExistsOptions<T>): Promise<boolean> {
    return !!(await this.findById(id, { ...options, projection: ['_id'] }));
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {MongoCollectionService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(options?: MongoCollectionService.ExistsOneOptions<T>): Promise<boolean> {
    return !!(await this.findOne({ ...options, projection: ['_id'] }));
  }

  /**
   * Finds a document by its ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document.
   * @param {MongoCollectionService.FindOneOptions<T>} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
    id: MongoAdapter.AnyId,
    options?: MongoCollectionService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(async () => {
      const documentFilter = await this._getDocumentFilter(info);
      const filter = MongoAdapter.prepareFilter([documentFilter, options?.filter]);
      return this._findById(id, { ...options, filter });
    }, info);
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoCollectionService.FindOneOptions<T>} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(options?: MongoCollectionService.FindOneOptions<T>): Promise<PartialDTO<T> | undefined> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findOne({ ...options, filter });
    }, info);
  }

  /**
   * Finds multiple documents in the MongoDB collection.
   *
   * @param {MongoCollectionService.FindManyOptions<T>} options - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options?: MongoCollectionService.FindManyOptions<T>): Promise<PartialDTO<T>[]> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findMany({ ...options, filter, limit: options?.limit || this.defaultLimit });
    }, info);
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {MongoCollectionService.FindManyOptions<T>} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findManyWithCount(options?: MongoCollectionService.FindManyOptions<T>): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'read',
      method: 'findManyWithCount',
      byId: false,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findManyWithCount({ ...options, filter, limit: options?.limit || this.defaultLimit });
    }, info);
  }

  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to retrieve.
   * @param {MongoCollectionService.FindOneOptions<T>} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: MongoAdapter.AnyId, options?: MongoCollectionService.FindOneOptions<T>): Promise<PartialDTO<T>> {
    const out = await this.findById(id, options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {MongoAdapter.AnyId} id - The id of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input object containing the fields to update.
   * @param {MongoCollectionService.UpdateOptions<T>} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoCollectionService.UpdateOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._update(id, input, { ...options, filter });
    }, info);
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input data to update the document with.
   * @param {MongoCollectionService.UpdateOptions<T>} [options] - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoCollectionService.UpdateOptions<T>,
  ): Promise<number> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._updateOnly(id, input, { ...options, filter });
    }, info);
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input to update the documents with.
   * @param {MongoCollectionService.UpdateManyOptions<T>} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoCollectionService.UpdateManyOptions<T>,
  ): Promise<number> {
    const info: MongoEntityService.CommandInfo = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._updateMany(input, { ...options, filter });
    }, info);
  }
}
