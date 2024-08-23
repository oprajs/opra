import { ResourceNotAvailableError } from '@opra/common';
import { EntityMetadata } from '@sqb/connect';
import type { PartialDTO, PatchDTO, RequiredSome, Type } from 'ts-gems';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

/**
 * @namespace SqbSingletonService
 */
export namespace SqbSingletonService {
  export interface Options extends SqbEntityService.Options {
    id?: SqbSingletonService<any>['id'];
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends SqbEntityService.CreateOptions {}

  /**
   * Represents options for "delete" operation
   *
   * @interface
   */
  export interface DeleteOptions extends SqbEntityService.DeleteOptions {}

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions extends SqbEntityService.ExistsOptions {}

  /**
   * Represents options for "find" operation
   *
   * @interface
   */
  export interface FindOptions extends SqbEntityService.FindOneOptions {}

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
}

/**
 * @class SqbSingletonService
 * @template T - The data type class type of the resource
 */
export abstract class SqbSingletonService<T extends object = object> extends SqbEntityService {
  /**
   * Represents a unique identifier for singleton record
   * @property {SQBAdapter.IdOrIds}
   */
  id: SQBAdapter.IdOrIds;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {SqbSingletonService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type<T> | string, options?: SqbSingletonService.Options) {
    super(dataType, options);
    this.id = options?.id || 1;
  }

  /**
   * Asserts the existence of a resource based on the given options.
   *
   * @returns {Promise<void>} A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} If the resource does not exist.
   */
  async assert(options?: SqbSingletonService.ExistsOptions): Promise<void> {
    if (!(await this.exists(options))) throw new ResourceNotAvailableError(this.getResourceName());
  }

  /**
   * Inserts a single record into the database.
   *
   * @param {PartialDTO<T>} input - The input data
   * @param {SqbSingletonService.CreateOptions} [options] - The options object
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created resource
   * @throws {Error} if an unknown error occurs while creating the resource
   */
  async create(
    input: PartialDTO<T>,
    options: RequiredSome<SqbSingletonService.CreateOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async create(input: PartialDTO<T>, options?: SqbSingletonService.CreateOptions): Promise<T>;
  async create(input: PartialDTO<T>, options?: SqbSingletonService.CreateOptions): Promise<PartialDTO<T>> {
    const command: SqbEntityService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const primaryFields = EntityMetadata.getPrimaryIndexColumns(this.entityMetadata);
      const data = { ...command.input };
      if (primaryFields.length > 1) {
        if (typeof primaryFields !== 'object') {
          throw new TypeError(
            `"${this.entityMetadata.name}" should has multiple primary key fields. So you should provide and object that contains key fields`,
          );
        }
        for (const field of primaryFields) {
          data[field.name] = this.id[field.name];
        }
      } else data[primaryFields[0].name] = this.id;
      command.input = data;
      return await this._create(command);
    });
  }

  /**
   * Deletes the singleton record
   *
   * @param {SqbSingletonService.DeleteOptions} [options] - The options object
   * @return {Promise<number>} - A Promise that resolves to the number of records deleted
   */
  async delete(options?: SqbSingletonService.DeleteOptions): Promise<number> {
    const command: SqbEntityService.DeleteOneCommand = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Checks if the singleton record exists.
   *
   * @param {SqbSingletonService.ExistsOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the record exists or not.
   */
  async exists(options?: SqbSingletonService.ExistsOptions): Promise<boolean> {
    const command: SqbEntityService.ExistsCommand = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._exists(command);
    });
  }

  /**
   * Finds the singleton record. Returns `undefined` if not found
   *
   * @param {SqbSingletonService.FindOneOptions} options - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async find(options: RequiredSome<SqbSingletonService.FindOptions, 'projection'>): Promise<PartialDTO<T> | undefined>;
  async find(options?: SqbSingletonService.FindOptions): Promise<T | undefined>;
  async find(options?: SqbSingletonService.FindOptions): Promise<PartialDTO<T> | T | undefined> {
    const command: SqbEntityService.FindOneCommand = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.parseFilter([await this._getCommonFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._findById(command);
    });
  }

  /**
   * Retrieves the singleton record. Throws error if not found.
   *
   * @param {SqbSingletonService.FindOptions} [options] - Optional options for the `find` operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document does not exist.
   */
  async get(options: RequiredSome<SqbSingletonService.FindOptions, 'projection'>): Promise<PartialDTO<T>>;
  async get(options?: SqbSingletonService.FindOptions): Promise<T>;
  async get(options?: SqbSingletonService.FindOptions): Promise<PartialDTO<T> | T> {
    const out = await this.find(options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName());
    return out;
  }

  /**
   * Updates the singleton.
   *
   * @param {PatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {SqbSingletonService.UpdateOptions} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
    input: PatchDTO<T>,
    options: RequiredSome<SqbSingletonService.UpdateOptions, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async update(input: PatchDTO<T>, options?: SqbSingletonService.UpdateOptions): Promise<T | undefined>;
  async update(
    input: PatchDTO<T>,
    options?: SqbSingletonService.UpdateOptions,
  ): Promise<PartialDTO<T> | T | undefined> {
    const command: SqbEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: this.id,
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
   * Updates the singleton and  returns updated record count
   *
   * @param {PatchDTO<T>} input - The partial input data to update the document with.
   * @param {SqbSingletonService.UpdateOptions} options - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(input: PatchDTO<T>, options?: SqbSingletonService.UpdateOnlyOptions): Promise<number> {
    const command: SqbEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: this.id,
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
}
