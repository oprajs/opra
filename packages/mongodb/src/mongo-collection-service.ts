import { ResourceNotAvailableError } from '@opra/common';
import mongodb, { UpdateFilter } from 'mongodb';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

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
   * @param {MongoEntityService.ExistsOptions<T>} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: MongoAdapter.AnyId, options?: MongoEntityService.ExistsOptions<T>): Promise<void> {
    if (!(await this.exists(id, options))) throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Creates a new document in the MongoDB collection.
   * Interceptors will be called before performing db operation
   *
   * @param {PartialDTO<T>} input - The input data for creating the document.
   * @param {MongoEntityService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created document.
   * @throws {Error} if an unknown error occurs while creating the document.
   */
  async create(input: PartialDTO<T>, options?: MongoEntityService.CreateOptions): Promise<PartialDTO<T>> {
    const command: MongoEntityService.CreateCommand = {
      crud: 'create',
      method: 'create',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, () => this._create(command));
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoEntityService.CountOptions<T>} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of documents in the collection.
   */
  async count(options?: MongoEntityService.CountOptions<T>): Promise<number> {
    const command: MongoEntityService.CountCommand<T> = {
      crud: 'read',
      method: 'count',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._count(command);
    });
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to delete.
   * @param {MongoEntityService.DeleteOptions<T>} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(id: MongoAdapter.AnyId, options?: MongoEntityService.DeleteOptions<T>): Promise<number> {
    const command: MongoEntityService.DeleteCommand<T> = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoEntityService.DeleteManyOptions<T>} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(options?: MongoEntityService.DeleteManyOptions<T>): Promise<number> {
    const command: MongoEntityService.DeleteCommand<T> = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._deleteMany(command);
    });
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   * @param {string} field
   * @param {MongoEntityService.DistinctOptions<T>} [options]
   * @protected
   */
  async distinct(field: string, options?: MongoEntityService.DistinctOptions<T>): Promise<any[]> {
    const command: MongoEntityService.DistinctCommand<T> = {
      crud: 'read',
      method: 'distinct',
      byId: false,
      field,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._distinct(command);
    });
  }

  /**
   * Checks if an object with the given id exists.
   *
   * @param {MongoAdapter.AnyId} id - The id of the object to check.
   * @param {MongoEntityService.ExistsOptions<T>} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async exists(id: MongoAdapter.AnyId, options?: MongoEntityService.ExistsOptions<T>): Promise<boolean> {
    const command: MongoEntityService.ExistsCommand<T> = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = MongoAdapter.prepareFilter([documentFilter, command.options?.filter]);
      const findCommand = command as MongoEntityService.FindOneCommand<T>;
      findCommand.options = { ...command.options, filter, projection: ['_id'] };
      return !!(await this._findById(findCommand));
    });
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {MongoEntityService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(options?: MongoEntityService.ExistsOptions<T>): Promise<boolean> {
    return !!(await this.findOne({ ...options, projection: ['_id'] }));
  }

  /**
   * Finds a document by its ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document.
   * @param {MongoEntityService.FindOneOptions<T>} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
    id: MongoAdapter.AnyId,
    options?: MongoEntityService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const command: MongoEntityService.FindOneCommand<T> = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = MongoAdapter.prepareFilter([documentFilter, command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._findById(command);
    });
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoEntityService.FindOneOptions<T>} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(options?: MongoEntityService.FindOneOptions<T>): Promise<PartialDTO<T> | undefined> {
    const command: MongoEntityService.FindOneCommand<T> = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._findOne(command);
    });
  }

  /**
   * Finds multiple documents in the MongoDB collection.
   *
   * @param {MongoEntityService.FindManyOptions<T>} options - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options?: MongoEntityService.FindManyOptions<T>): Promise<PartialDTO<T>[]> {
    const command: MongoEntityService.FindManyCommand<T> = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter, limit: command.options?.limit || this.defaultLimit };
      return this._findMany(command);
    });
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {MongoEntityService.FindManyOptions<T>} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findManyWithCount(options?: MongoEntityService.FindManyOptions<T>): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const command: MongoEntityService.FindManyCommand<T> = {
      crud: 'read',
      method: 'findManyWithCount',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter, limit: command.options?.limit || this.defaultLimit };
      return this._findManyWithCount(command);
    });
  }

  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to retrieve.
   * @param {MongoEntityService.FindOneOptions<T>} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: MongoAdapter.AnyId, options?: MongoEntityService.FindOneOptions<T>): Promise<PartialDTO<T>> {
    const out = await this.findById(id, options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {MongoAdapter.AnyId} id - The id of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input object containing the fields to update.
   * @param {MongoEntityService.UpdateOneOptions<T>} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const command: MongoEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input: isUpdateFilter ? undefined : input,
      inputRaw: isUpdateFilter ? input : undefined,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._update(command);
    });
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input data to update the document with.
   * @param {MongoEntityService.UpdateOneOptions<T>} [options] - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateOneOptions<T>,
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const command: MongoEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'updateOnly',
      documentId: id,
      byId: true,
      input: isUpdateFilter ? undefined : input,
      inputRaw: isUpdateFilter ? input : undefined,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._updateOnly(command);
    });
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input to update the documents with.
   * @param {MongoEntityService.UpdateManyOptions<T>} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(
    input: PatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateManyOptions<T>,
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const command: MongoEntityService.UpdateManyCommand<T> = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input: isUpdateFilter ? undefined : input,
      inputRaw: isUpdateFilter ? input : undefined,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._updateMany(command);
    });
  }
}
