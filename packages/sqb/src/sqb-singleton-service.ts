import { ResourceNotAvailableError } from '@opra/common';
import { EntityMetadata } from '@sqb/connect';
import type { PartialDTO, PatchDTO, RequiredSome, Type } from 'ts-gems';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

/**
 * Options for SqbSingletonService.
 */
export namespace SqbSingletonService {
  /**
   * Configuration options for SqbSingletonService.
   */
  export interface Options extends SqbEntityService.Options {
    /**
     * The identifier used to locate the singleton record.
     */
    id?: SqbSingletonService<any>['id'];
  }
}

/**
 * Service for managing a single entity record backed by an SQB data source.
 *
 * @typeParam T - The entity type managed by this service
 */
export class SqbSingletonService<
  T extends object = object,
> extends SqbEntityService<T> {
  /**
   * The identifier used to locate the singleton record.
   */
  id: SQBAdapter.IdOrIds;

  /**
   * Constructs a new instance.
   *
   * @param dataType - The entity class or its registered name.
   * @param options - Options for the singleton service.
   */
  constructor(
    dataType: Type<T> | string,
    options?: SqbSingletonService.Options,
  ) {
    super(dataType, options);
    this.id = options?.id || 1;
  }

  /**
   * Asserts that the singleton record exists.
   * Throws {@link ResourceNotAvailableError} if it does not.
   *
   * @param options - Optional existence check options.
   * @throws {@link ResourceNotAvailableError} If the record does not exist.
   */
  async assert(options?: SqbEntityService.ExistsOptions): Promise<void> {
    if (!(await this.exists(options)))
      throw new ResourceNotAvailableError(this.getResourceName());
  }

  /**
   * Creates the singleton record and returns it with the requested projection.
   *
   * @param input - The input data for the new record.
   * @param options - Options including a required `projection`.
   * @returns The created record as a partial DTO.
   */
  async create(
    input: PartialDTO<T>,
    options: RequiredSome<SqbEntityService.CreateOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  /**
   * Creates the singleton record and returns the full DTO.
   *
   * @param input - The input data for the new record.
   * @param options - Optional create options.
   * @returns The created record as a full DTO.
   */
  async create(
    input: PartialDTO<T>,
    options?: SqbEntityService.CreateOptions,
  ): Promise<T>;
  async create(
    input: PartialDTO<T>,
    options?: SqbEntityService.CreateOptions,
  ): Promise<PartialDTO<T>> {
    const command: SqbEntityService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const primaryFields = EntityMetadata.getPrimaryIndexColumns(
        this.entityMetadata,
      );
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
   * Deletes the singleton record.
   *
   * @param options - Optional delete options.
   * @returns The number of records deleted.
   */
  async delete(options?: SqbEntityService.DeleteOptions): Promise<number> {
    const command: SqbEntityService.DeleteOneCommand = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.prepareFilter([
        await this._getCommonFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Checks whether the singleton record exists.
   *
   * @param options - Optional query options.
   * @returns `true` if the record exists, `false` otherwise.
   */
  async exists(options?: SqbEntityService.ExistsOptions): Promise<boolean> {
    const command: SqbEntityService.ExistsCommand = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.prepareFilter([
        await this._getCommonFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._exists(command);
    });
  }

  /**
   * Finds the singleton record with the requested projection.
   * Returns `undefined` if it does not exist.
   *
   * @param options - Options including a required `projection`.
   * @returns The record as a partial DTO, or `undefined`.
   */
  async find(
    options: RequiredSome<SqbEntityService.FindOneOptions, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  /**
   * Finds the singleton record. Returns `undefined` if it does not exist.
   *
   * @param options - Optional query options.
   * @returns The record as a full DTO, or `undefined`.
   */
  async find(options?: SqbEntityService.FindOneOptions): Promise<T | undefined>;
  async find(
    options?: SqbEntityService.FindOneOptions,
  ): Promise<PartialDTO<T> | T | undefined> {
    const command: SqbEntityService.FindOneCommand = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: this.id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.prepareFilter([
        await this._getCommonFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._findById(command);
    });
  }

  /**
   * Retrieves the singleton record with the requested projection.
   * Throws if the record does not exist.
   *
   * @param options - Options including a required `projection`.
   * @returns The record as a partial DTO.
   * @throws {@link ResourceNotAvailableError} If the record does not exist.
   */
  async get(
    options: RequiredSome<SqbEntityService.FindOneOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  /**
   * Retrieves the singleton record. Throws if it does not exist.
   *
   * @param options - Optional query options.
   * @returns The record as a full DTO.
   * @throws {@link ResourceNotAvailableError} If the record does not exist.
   */
  async get(options?: SqbEntityService.FindOneOptions): Promise<T>;
  async get(
    options?: SqbEntityService.FindOneOptions,
  ): Promise<PartialDTO<T> | T> {
    const out = await this.find(options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName());
    return out;
  }

  /**
   * Updates the singleton record and returns it with the requested projection.
   *
   * @param input - The fields to update.
   * @param options - Options including a required `projection`.
   * @returns The updated record as a partial DTO, or `undefined` if not found.
   */
  async update(
    input: PatchDTO<T>,
    options: RequiredSome<SqbEntityService.UpdateOneOptions, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  /**
   * Updates the singleton record and returns the full DTO.
   *
   * @param input - The fields to update.
   * @param options - Optional update options.
   * @returns The updated record as a full DTO, or `undefined` if not found.
   */
  async update(
    input: PatchDTO<T>,
    options?: SqbEntityService.UpdateOneOptions,
  ): Promise<T | undefined>;
  async update(
    input: PatchDTO<T>,
    options?: SqbEntityService.UpdateOneOptions,
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
      const filter = SQBAdapter.prepareFilter([
        await this._getCommonFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._update(command);
    });
  }

  /**
   * Updates the singleton record without returning it.
   *
   * @param input - The fields to update.
   * @param options - Optional update options.
   * @returns The number of records modified.
   */
  async updateOnly(
    input: PatchDTO<T>,
    options?: SqbEntityService.UpdateOneOptions,
  ): Promise<number> {
    const command: SqbEntityService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: this.id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = SQBAdapter.prepareFilter([
        await this._getCommonFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return this._updateOnly(command);
    });
  }
}
