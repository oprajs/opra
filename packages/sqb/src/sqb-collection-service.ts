import { ResourceNotAvailableError } from '@opra/common';
import type { PartialDTO, PatchDTO, RequiredSome, Type } from 'ts-gems';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

/**
 * @namespace SqbCollectionService
 */
export namespace SqbCollectionService {
  export interface Options extends SqbEntityService.Options {
    defaultLimit?: SqbCollectionService<any>['defaultLimit'];
    interceptor?: SqbCollectionService<any>['interceptor'];
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends SqbEntityService.CreateOptions {}

  /**
   * Represents options for "count" operation
   *
   * @interface
   */
  export interface CountOptions extends SqbEntityService.CountOptions {}

  /**
   * Represents options for "delete" operation
   *
   * @interface
   */
  export interface DeleteOptions extends SqbEntityService.DeleteOptions {}

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   */
  export interface DeleteManyOptions extends SqbEntityService.DeleteManyOptions {}

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions extends SqbEntityService.ExistsOptions {}

  /**
   * Represents options for "existsOne" operation
   *
   * @interface
   */
  export interface ExistsOneOptions extends SqbEntityService.ExistsOptions {}

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   */
  export interface FindOneOptions extends SqbEntityService.FindOneOptions {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   */
  export interface FindManyOptions extends SqbEntityService.FindManyOptions {}

  /**
   * Represents options for "update" operation
   *
   * @interface
   */
  export interface UpdateOptions extends SqbEntityService.UpdateOneOptions {}

  /**
   * Represents options for "updateOnly" operation
   *
   * @interface
   */
  export interface UpdateOnlyOptions extends SqbEntityService.UpdateOneOptions {}

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   */
  export interface UpdateManyOptions extends SqbEntityService.UpdateManyOptions {}
}

/**
 * @class SqbCollectionService
 * @template T - The data type class type of the resource
 */
export abstract class SqbCollectionService<T extends object = object> extends SqbEntityService {
  /**
   * Represents default limit for findMany operation
   */
  defaultLimit: number;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {SqbCollectionService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type<T> | string, options?: SqbCollectionService.Options) {
    super(dataType, options);
    this.defaultLimit = options?.defaultLimit || 100;
  }

  /**
   * Asserts the existence of a resource with the given ID.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {SQBAdapter.IdOrIds} id - The ID of the resource to assert.
   * @param {SqbCollectionService.ExistsOptions} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: SQBAdapter.IdOrIds, options?: SqbCollectionService.ExistsOptions): Promise<void> {
    if (!(await this.exists(id, options))) throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Creates a new resource
   *
   * @param {PartialDTO<T>} input - The input data
   * @param {SqbCollectionService.CreateOptions} [options] - The options object
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created resource
   * @throws {Error} if an unknown error occurs while creating the resource
   */
  async create(
    input: PartialDTO<T>,
    options: RequiredSome<SqbCollectionService.CreateOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async create(input: PartialDTO<T>, options?: SqbCollectionService.CreateOptions): Promise<T>;
  async create(input: PartialDTO<T>, options?: SqbCollectionService.CreateOptions): Promise<PartialDTO<T>> {
    const command: SqbEntityService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, () => this._create(command));
  }

  /**
   * Returns the count of records based on the provided options
   *
   * @param {SqbCollectionService.CountOptions} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of records
   */
  async count(options?: SqbCollectionService.CountOptions): Promise<number> {
    const command: SqbEntityService.CountCommand = {
      crud: 'read',
      method: 'count',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._count(command);
    });
  }

  /**
   * Deletes a record from the collection.
   *
   * @param {SQBAdapter.IdOrIds} id - The ID of the document to delete.
   * @param {SqbCollectionService.DeleteOptions} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(id: SQBAdapter.IdOrIds, options?: SqbCollectionService.DeleteOptions): Promise<number> {
    const command: SqbEntityService.DeleteOneCommand = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {SqbCollectionService.DeleteManyOptions} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(options?: SqbCollectionService.DeleteManyOptions): Promise<number> {
    const command: SqbEntityService.DeleteManyCommand = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._deleteMany(command);
    });
  }

  /**
   * Checks if a record with the given id exists.
   *
   * @param {SQBAdapter.IdOrIds} id - The id of the object to check.
   * @param {SqbCollectionService.ExistsOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the record exists or not.
   */
  async exists(id: SQBAdapter.IdOrIds, options?: SqbCollectionService.ExistsOptions): Promise<boolean> {
    const command: SqbEntityService.ExistsCommand = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._exists(command);
    });
  }

  /**
   * Checks if a record with the given arguments exists.
   *
   * @param {SqbCollectionService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the record exists or not.
   */
  async existsOne(options?: SqbCollectionService.ExistsOneOptions): Promise<boolean> {
    const command: SqbEntityService.ExistsCommand = {
      crud: 'read',
      method: 'existsOne',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._existsOne(command);
    });
  }

  /**
   * Finds a record by ID.
   *
   * @param {SQBAdapter.IdOrIds} id - The ID of the record.
   * @param {SqbCollectionService.FindOneOptions} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
    id: SQBAdapter.IdOrIds,
    options?: SqbCollectionService.FindOneOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const command: SqbEntityService.FindOneCommand = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getCommonFilter(command);
      const filter = SQBAdapter.parseFilter([documentFilter, command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._findById(command);
    });
  }

  /**
   * Finds a record in the collection that matches the specified options.
   *
   * @param {SqbCollectionService.FindOneOptions} options - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(options?: SqbCollectionService.FindOneOptions): Promise<PartialDTO<T> | undefined> {
    const command: SqbEntityService.FindOneCommand = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._findOne(command);
    });
  }

  /**
   * Finds multiple records in collection.
   *
   * @param {SqbCollectionService.FindManyOptions} options - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options?: SqbCollectionService.FindManyOptions): Promise<PartialDTO<T>[]> {
    const command: SqbEntityService.FindManyCommand = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      const limit = command.options?.limit || this.defaultLimit;
      command.options = { ...command.options, filter, limit };
      return this._findMany(command);
    });
  }

  /**
   * Finds multiple records in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {SqbCollectionService.FindManyOptions} options - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T and total count.
   */
  async findManyWithCount(options?: SqbCollectionService.FindManyOptions): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const [items, count] = await Promise.all([this.findMany(options), this.count(options)]);
    return { count, items };
  }

  /**
   * Retrieves a records from the collection by its ID. Throws error if not found.
   *
   * @param {SQBAdapter.IdOrIds} id - The ID of the document to retrieve.
   * @param {SqbCollectionService.FindOneOptions} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: SQBAdapter.IdOrIds, options?: SqbCollectionService.FindOneOptions): Promise<PartialDTO<T>> {
    const out = await this.findById(id, options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a record with the given id in the collection.
   *
   * @param {SQBAdapter.IdOrIds} id - The id of the document to update.
   * @param {PatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {SqbCollectionService.UpdateOptions} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
    id: SQBAdapter.IdOrIds,
    input: PatchDTO<T>,
    options?: SqbCollectionService.UpdateOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const command: SqbEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._update(command);
    });
  }

  /**
   * Updates a record in the collection with the specified ID and returns updated record count
   *
   * @param {any} id - The ID of the document to update.
   * @param {PatchDTO<T>} input - The partial input data to update the document with.
   * @param {SqbCollectionService.UpdateOptions} options - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(
    id: SQBAdapter.IdOrIds,
    input: PatchDTO<T>,
    options?: SqbCollectionService.UpdateOnlyOptions,
  ): Promise<number> {
    const command: SqbEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._updateOnly(command);
    });
  }

  /**
   * Updates multiple records in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>} input - The partial input to update the documents with.
   * @param {SqbCollectionService.UpdateManyOptions} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(input: PatchDTO<T>, options?: SqbCollectionService.UpdateManyOptions): Promise<number> {
    const command: SqbEntityService.UpdateManyCommand<T> = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._updateMany(command);
    });
  }
}
