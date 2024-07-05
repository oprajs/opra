import { ResourceNotAvailableError } from '@opra/common';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { ElasticAdapter } from './elastic-adapter.js';
import { ElasticService } from './elastic-service.js';

/**
 *
 * @namespace ElasticCollectionService
 */
export namespace ElasticCollectionService {
  /**
   * The constructor options of ElasticCollectionService.
   *
   * @interface Options
   * @extends ElasticService.Options
   */
  export interface Options extends ElasticEntityService.Options {
    defaultLimit?: number;
  }

  export interface CreateOptions extends ElasticEntityService.CreateOptions {}

  export interface CountOptions<T> extends ElasticEntityService.CountOptions<T> {}

  export interface DeleteOptions<T> extends ElasticEntityService.DeleteOptions<T> {}

  export interface DeleteManyOptions<T> extends ElasticEntityService.DeleteManyOptions<T> {}

  export interface DistinctOptions<T> extends ElasticEntityService.DistinctOptions<T> {}

  export interface ExistsOptions<T> extends ElasticService.ExistsOptions<T> {}

  export interface ExistsOneOptions<T> extends ElasticService.ExistsOneOptions<T> {}

  export interface FindOneOptions<T> extends ElasticEntityService.FindOneOptions<T> {}

  export interface FindManyOptions<T> extends ElasticEntityService.FindManyOptions<T> {}

  export interface UpdateOptions<T> extends ElasticEntityService.UpdateOptions<T> {}

  export interface UpdateManyOptions<T> extends ElasticEntityService.UpdateManyOptions<T> {}
}

/**
 * @class ElasticCollectionService
 * @template T - The type of the documents in the collection.
 */
export class ElasticCollectionService<T extends object> extends ElasticService<T> {
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
   * @param {ElasticCollectionService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(
    dataType: Type | string,
    indexName: ElasticCollectionService<any>['$indexName'],
    options?: ElasticCollectionService.Options,
  ) {
    super(dataType, indexName, options);
    this.defaultLimit = this.defaultLimit || options?.defaultLimit || 10;
  }

  /**
   * Asserts the existence of a resource with the given ID.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {ElasticAdapter.AnyId} id - The ID of the resource to assert.
   * @param {ElasticCollectionService.ExistsOptions<T>} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: ElasticAdapter.AnyId, options?: ElasticCollectionService.ExistsOptions<T>): Promise<void> {
    if (!(await this.exists(id, options))) throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Creates a new document in the ElasticDB collection.
   * Interceptors will be called before performing db operation
   *
   * @param {PartialDTO<T>} input - The input data for creating the document.
   * @param {ElasticCollectionService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created document.
   * @throws {Error} if an unknown error occurs while creating the document.
   */
  async create(input: PartialDTO<T>, options?: ElasticCollectionService.CreateOptions): Promise<PartialDTO<T>> {
    const id = (input as any)._id || this._generateId();
    if (id != null) (input as any)._id = id;
    const info: ElasticService.CommandInfo = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId: id,
      input,
      options,
    };
    return this._intercept(() => this._create(input, options), info);
  }

  /**
   * Returns the count of documents in the index.
   *
   * @param params - The params for the count operation.
   * @param options - The options for the count operation.
   * @return - A promise that resolves to the count of documents in the index.
   */
  async count(params?: T.CountRequest, options?: TransportRequestOptions): Promise<number> {
    const info: ElasticService.CommandInfo = {
      crud: 'read',
      method: 'count',
      byId: false,
      options,
    };
    return this._intercept(async () => {
      const query = ElasticService.prepareFilter([await this._getCommonFilter(info), params?.query]);
      return this.getClient().count({ ...params, query }, options);
    }, info);
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {ElasticAdapter.AnyId} id - The ID of the document to delete.
   * @param {ElasticCollectionService.DeleteOptions<T>} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(id: ElasticAdapter.AnyId, options?: ElasticCollectionService.DeleteOptions<T>): Promise<number> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: id,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._delete(id, { ...options, filter });
    }, info);
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {ElasticCollectionService.DeleteManyOptions<T>} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(options?: ElasticCollectionService.DeleteManyOptions<T>): Promise<number> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._deleteMany({ ...options, filter });
    }, info);
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   * @param {string} field
   * @param {ElasticCollectionService.DistinctOptions<T>} [options]
   * @protected
   */
  async distinct(field: string, options?: ElasticCollectionService.DistinctOptions<T>): Promise<any[]> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'read',
      method: 'distinct',
      byId: true,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._distinct(field, { ...options, filter });
    }, info);
  }

  /**
   * Checks if an object with the given id exists.
   *
   * @param {ElasticAdapter.AnyId} id - The id of the object to check.
   * @param {ElasticCollectionService.ExistsOptions<T>} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async exists(id: ElasticAdapter.AnyId, options?: ElasticCollectionService.ExistsOptions<T>): Promise<boolean> {
    return !!(await this.findById(id, { ...options, projection: ['_id'] }));
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {ElasticCollectionService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(options?: ElasticCollectionService.ExistsOneOptions<T>): Promise<boolean> {
    return !!(await this.findOne({ ...options, projection: ['_id'] }));
  }

  /**
   * Finds a document by its ID.
   *
   * @param {ElasticAdapter.AnyId} id - The ID of the document.
   * @param {ElasticCollectionService.FindOneOptions<T>} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
    id: ElasticAdapter.AnyId,
    options?: ElasticCollectionService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = await this._getDocumentFilter(info);
      const filter = ElasticAdapter.prepareFilter([documentFilter, options?.filter]);
      return this._findById(id, { ...options, filter });
    }, info);
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {ElasticCollectionService.FindOneOptions<T>} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(options?: ElasticCollectionService.FindOneOptions<T>): Promise<PartialDTO<T> | undefined> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findOne({ ...options, filter });
    }, info);
  }

  /**
   * Finds multiple documents in the ElasticDB collection.
   *
   * @param {ElasticCollectionService.FindManyOptions<T>} options - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options?: ElasticCollectionService.FindManyOptions<T>): Promise<PartialDTO<T>[]> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findMany({ ...options, filter, limit: options?.limit || this.defaultLimit });
    }, info);
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {ElasticCollectionService.FindManyOptions<T>} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findManyWithCount(options?: ElasticCollectionService.FindManyOptions<T>): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'read',
      method: 'findManyWithCount',
      byId: false,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._findManyWithCount({ ...options, filter, limit: options?.limit || this.defaultLimit });
    }, info);
  }

  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {ElasticAdapter.AnyId} id - The ID of the document to retrieve.
   * @param {ElasticCollectionService.FindOneOptions<T>} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: ElasticAdapter.AnyId, options?: ElasticCollectionService.FindOneOptions<T>): Promise<PartialDTO<T>> {
    const out = await this.findById(id, options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {ElasticAdapter.AnyId} id - The id of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input object containing the fields to update.
   * @param {ElasticCollectionService.UpdateOptions<T>} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
    id: ElasticAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: ElasticCollectionService.UpdateOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._update(id, input, { ...options, filter });
    }, info);
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {ElasticAdapter.AnyId} id - The ID of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input data to update the document with.
   * @param {ElasticCollectionService.UpdateOptions<T>} [options] - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(
    id: ElasticAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: ElasticCollectionService.UpdateOptions<T>,
  ): Promise<number> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._updateOnly(id, input, { ...options, filter });
    }, info);
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input to update the documents with.
   * @param {ElasticCollectionService.UpdateManyOptions<T>} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: ElasticCollectionService.UpdateManyOptions<T>,
  ): Promise<number> {
    const info: ElasticEntityService.CommandInfo = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input,
      options,
    };
    return this._intercept(async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(info), options?.filter]);
      return this._updateMany(input, { ...options, filter });
    }, info);
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns {ElasticAdapter.AnyId} The generated ID.
   */
  protected _generateId(): ElasticAdapter.AnyId {
    return typeof this.$idGenerator === 'function' ? this.$idGenerator(this) : new ObjectId();
  }
}
