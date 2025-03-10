import { omit } from '@jsopen/objects';
import { ResourceNotAvailableError } from '@opra/common';
import mongodb, { ObjectId, type UpdateFilter } from 'mongodb';
import type { PartialDTO, RequiredSome, Type } from 'ts-gems';
import { MongoAdapter } from '../adapter/mongo-adapter.js';
import type { MongoPatchDTO } from '../types.js';
import { MongoEntityService } from './mongo-entity-service.js';

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
}

/**
 * A class that provides access to a MongoDB collection, with support for singleton document operations.
 * @class MongoSingletonService
 * @extends MongoService
 * @template T - The type of document stored in the collection
 */
export class MongoSingletonService<
  T extends mongodb.Document,
> extends MongoEntityService<T> {
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
  constructor(
    dataType: Type | string,
    options?: MongoSingletonService.Options,
  ) {
    super(dataType, options);
    this._id = options?._id || new ObjectId('655608925cad472b75fc6485');
  }

  /**
   * Asserts the existence of a resource based on the given options.
   *
   * @param {MongoEntityService.ExistsOptions<T>} [options]
   * @returns {Promise<void>} A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} If the resource does not exist.
   */
  async assert(options?: MongoEntityService.ExistsOptions<T>): Promise<void> {
    if (!(await this.exists(options)))
      throw new ResourceNotAvailableError(this.getResourceName());
  }

  /**
   * Creates the document in the database.
   *
   * @param {PartialDTO<T>} input - The partial input to create the document with.
   * @param {MongoEntityService.CreateOptions} [options] - The options for creating the document.
   * @return {Promise<PartialDTO<T>>} A promise that resolves to the partial output of the created document.
   * @throws {Error} Throws an error if an unknown error occurs while creating the document.
   */
  async create(
    input: PartialDTO<T>,
    options: RequiredSome<MongoEntityService.CreateOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async create(
    input: PartialDTO<T>,
    options?: MongoEntityService.CreateOptions,
  ): Promise<T>;
  async create(
    input: PartialDTO<T>,
    options?: MongoEntityService.CreateOptions,
  ): Promise<PartialDTO<T> | T> {
    const command: MongoEntityService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      input,
      options,
    };
    (input as any)._id = this._id;
    return this._executeCommand(command, async () => {
      const r = await this._create(command);
      if (!command.options?.projection) return r;
      const findCommand: MongoEntityService.FindOneCommand<T> = {
        ...command,
        crud: 'read',
        byId: true,
        documentId: r._id,
        options,
      };
      const out = await this._findById(findCommand);
      if (out) return out;
    });
  }

  /**
   * Creates the document in the database.
   *
   * @param {PartialDTO<T>} input - The partial input to create the document with.
   * @param {MongoEntityService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<T>} A promise that resolves create operation result
   * @throws {Error} Throws an error if an unknown error occurs while creating the document.
   */
  async createOnly(
    input: PartialDTO<T>,
    options?: MongoEntityService.CreateOptions,
  ): Promise<T> {
    const command: MongoEntityService.CreateCommand<T> = {
      crud: 'create',
      method: 'createOnly',
      byId: false,
      input,
      options,
    };
    (input as any)._id = this._id;
    return this._executeCommand(command, () => this._create(command));
  }

  /**
   * Deletes a record from the database
   *
   * @param {MongoEntityService.DeleteOptions<T>} options - The options for deleting the record
   * @returns {Promise<number>} The number of records deleted
   */
  async delete(options?: MongoEntityService.DeleteOptions<T>): Promise<number> {
    const command: MongoEntityService.DeleteCommand<T> = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: this._id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Checks if the document exists in the database.
   *
   * @param {MongoEntityService.FindOneOptions<T>} [options] - The options for finding the document.
   * @return {Promise<boolean>} - A promise that resolves to a boolean value indicating if the document exists.
   */
  async exists(
    options?: MongoEntityService.ExistsOptions<T>,
  ): Promise<boolean> {
    const command: MongoEntityService.ExistsCommand<T> = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: this._id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = MongoAdapter.prepareFilter([
        documentFilter,
        command.options?.filter,
      ]);
      const findCommand = command as MongoEntityService.FindOneCommand<T>;
      findCommand.options = { ...command.options, filter, projection: ['_id'] };
      return !!(await this._findById(findCommand));
    });
  }

  /**
   * Fetches the document if it exists. Returns undefined if not found.
   *
   * @param {MongoEntityService.FindOneOptions<T>} [options] - The options for finding the document.
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async find(
    options: RequiredSome<MongoEntityService.FindOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async find(
    options?: MongoEntityService.FindOneOptions<T>,
  ): Promise<T | undefined>;
  async find(
    options?: MongoEntityService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const command: MongoEntityService.FindOneCommand<T> = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: this._id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = MongoAdapter.prepareFilter([
        documentFilter,
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._findById(command);
    });
  }

  /**
   * Fetches the document from the Mongo collection service. Throws error if not found.
   *
   * @param {MongoEntityService.FindOneOptions<T>} options - The options to customize the query.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves to the fetched document.
   * @throws {ResourceNotAvailableError} - If the document is not found in the collection
   */
  async get(
    options: RequiredSome<MongoEntityService.FindOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async get(options?: MongoEntityService.FindOneOptions<T>): Promise<T>;
  async get(
    options?: MongoEntityService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | T> {
    const out = await this.find(options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName());
    return out;
  }

  /**
   * Updates a document in the MongoDB collection
   *
   * @param {MongoPatchDTO<T>} input - The partial input to update the document.
   * @param {MongoEntityService.UpdateOneOptions<T>} [options] - The update options.
   *
   * @return {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the updated document or undefined if not found.
   */
  async update(
    input: MongoPatchDTO<T> | UpdateFilter<T>,
    options: RequiredSome<MongoEntityService.UpdateOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async update(
    input: MongoPatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateOneOptions<T>,
  ): Promise<T | undefined>;
  async update(
    input: MongoPatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateOneOptions<T>,
  ): Promise<PartialDTO<T> | T | undefined> {
    const isUpdateFilter =
      Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const command: MongoEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: this._id,
      byId: true,
      input: isUpdateFilter ? undefined : (input as MongoPatchDTO<T>),
      inputRaw: isUpdateFilter ? input : undefined,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      const matchCount = await this._updateOnly(command);
      if (matchCount) {
        const findCommand: MongoEntityService.FindOneCommand<T> = {
          ...command,
          crud: 'read',
          byId: true,
          documentId: this._id,
          options: omit(options!, ['filter', 'sort']),
        };
        const out = await this._findById(findCommand);
        if (out) return out;
      }
    });
  }

  /**
   * Updates a document in the MongoDB collection
   *
   * @param {MongoPatchDTO<T>} input - The partial input to update the document.
   * @param {MongoEntityService.UpdateOneOptions<T>} [options] - The update options.
   *
   * @return {Promise<number>} - A promise that resolves to the updated document or undefined if not found.
   */
  async updateOnly(
    input: MongoPatchDTO<T> | UpdateFilter<T>,
    options?: MongoEntityService.UpdateOneOptions<T>,
  ): Promise<number> {
    const command: MongoEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'updateOnly',
      documentId: this._id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._updateOnly(command);
    });
  }
}
