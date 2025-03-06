import { omit } from '@jsopen/objects';
import {
  ComplexType,
  NotAcceptableError,
  ResourceNotAvailableError,
} from '@opra/common';
import mongodb from 'mongodb';
import type { DTO, PartialDTO, RequiredSome, StrictOmit, Type } from 'ts-gems';
import { isNotNullish } from 'valgen';
import { MongoAdapter } from '../adapter/mongo-adapter.js';
import { MongoPatchGenerator } from '../adapter/mongo-patch-generator.js';
import type { MongoPatchDTO } from '../types.js';
import type { MongoEntityService } from './mongo-entity-service.js';
import { MongoService } from './mongo-service.js';

/**
 *
 * @namespace MongoNestedService
 */
export namespace MongoNestedService {
  /**
   * The constructor options of MongoArrayService.
   */
  export interface Options extends MongoService.Options {
    defaultLimit?: number;
    nestedKey?: string;
    nestedFilter?:
      | MongoAdapter.FilterInput
      | ((
          args: MongoService.CommandInfo,
          _this: this,
        ) =>
          | MongoAdapter.FilterInput
          | Promise<MongoAdapter.FilterInput>
          | undefined);
  }

  export interface CommandInfo extends MongoService.CommandInfo {}

  export interface CreateOptions extends MongoService.CreateOptions {}

  export interface CountOptions<T> extends MongoService.CountOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface DeleteOptions<T> extends MongoService.DeleteOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface DeleteManyOptions<T>
    extends MongoService.DeleteManyOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface FindOneOptions<T> extends MongoService.FindOneOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface FindManyOptions<T> extends MongoService.FindManyOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
    nestedFilter?: MongoAdapter.FilterInput;
  }

  export interface UpdateOneOptions<T>
    extends MongoService.UpdateOneOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface UpdateManyOptions<T>
    extends MongoService.UpdateManyOptions<T> {
    documentFilter?: MongoAdapter.FilterInput;
  }

  export interface CreateCommand<T>
    extends RequiredSome<CommandInfo, 'documentId' | 'input'> {
    crud: 'create';
    input: DTO<T>;
    options?: CreateOptions;
  }

  export interface CountCommand<T>
    extends StrictOmit<
      RequiredSome<CommandInfo, 'documentId'>,
      'nestedId' | 'input'
    > {
    crud: 'read';
    options?: CountOptions<T>;
  }

  export interface DeleteCommand<T>
    extends StrictOmit<RequiredSome<CommandInfo, 'documentId'>, 'input'> {
    crud: 'delete';
    options?: DeleteOptions<T>;
  }

  export interface ExistsCommand<T>
    extends StrictOmit<RequiredSome<CommandInfo, 'documentId'>, 'input'> {
    crud: 'read';
    options?: ExistsOptions<T>;
  }

  export interface FindOneCommand<T>
    extends StrictOmit<RequiredSome<CommandInfo, 'documentId'>, 'input'> {
    crud: 'read';
    options?: FindOneOptions<T>;
  }

  export interface FindManyCommand<T>
    extends StrictOmit<RequiredSome<CommandInfo, 'documentId'>, 'input'> {
    crud: 'read';
    options?: FindManyOptions<T>;
  }

  export interface UpdateOneCommand<T>
    extends RequiredSome<CommandInfo, 'documentId'> {
    crud: 'update';
    input: MongoPatchDTO<T> | mongodb.UpdateFilter<T>;
    options?: MongoNestedService.UpdateOneOptions<T>;
  }

  export interface UpdateManyCommand<T>
    extends RequiredSome<CommandInfo, 'documentId'> {
    crud: 'update';
    input: MongoPatchDTO<T> | mongodb.UpdateFilter<T>;
    options?: MongoNestedService.UpdateManyOptions<T>;
  }
}

/**
 * A class that provides methods to perform operations on an array field in a MongoDB collection.
 * @class MongoNestedService
 * @template T The type of the array item.
 */
export class MongoNestedService<
  T extends mongodb.Document,
> extends MongoService<T> {
  /**
   * Represents the name of the array field in parent document
   *
   * @type {string}
   */
  fieldName: string;

  /**
   * Represents the value of a nested array key field
   *
   * @type {string}
   */
  nestedKey: string;

  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  /**
   * Represents a common array filter function
   *
   * @type {FilterInput | Function}
   */
  nestedFilter?:
    | MongoAdapter.FilterInput
    | ((
        args: MongoService.CommandInfo,
        _this: this,
      ) =>
        | MongoAdapter.FilterInput
        | Promise<MongoAdapter.FilterInput>
        | undefined);

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {string} fieldName - The name of the field in the document representing the array.
   * @param {MongoNestedService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(
    dataType: Type | string,
    fieldName: string,
    options?: MongoNestedService.Options,
  ) {
    super(dataType, options);
    this.fieldName = fieldName;
    this.nestedKey = options?.nestedKey || '_id';
    this.defaultLimit = options?.defaultLimit || 10;
    this.nestedFilter = options?.nestedFilter;
  }

  /**
   * Retrieves the data type of the array field
   *
   * @returns {ComplexType} The complex data type of the field.
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  override get dataType(): ComplexType {
    const t = super.dataType.getField(this.fieldName, this.scope).type;
    if (!(t instanceof ComplexType))
      throw new NotAcceptableError(
        `Data type "${t.name}" is not a ComplexType`,
      );
    return t;
  }

  /**
   * Asserts whether a resource with the specified parentId and id exists.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} id - The ID of the resource.
   * @param {MongoNestedService.ExistsOptions<T>} [options] - Optional parameters for checking resource existence.
   * @return {Promise<void>} - A promise that resolves with no value upon success.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(
    documentId: MongoAdapter.AnyId,
    id: MongoAdapter.AnyId,
    options?: MongoNestedService.ExistsOptions<T>,
  ): Promise<void> {
    if (!(await this.exists(documentId, id, options))) {
      throw new ResourceNotAvailableError(
        this.getResourceName() + '.' + this.nestedKey,
        documentId + '/' + id,
      );
    }
  }

  /**
   * Adds a single item into the array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {PartialDTO<T>} input - The item to be added to the array field.
   * @param {MongoNestedService.CreateOptions<T>} [options] - Optional options for the create operation.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves with the partial output of the created item.
   * @throws {ResourceNotAvailableError} - If the parent document is not found.
   */
  async create(
    documentId: MongoAdapter.AnyId,
    input: PartialDTO<T>,
    options: RequiredSome<MongoNestedService.CreateOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async create(
    documentId: MongoAdapter.AnyId,
    input: PartialDTO<T>,
    options?: MongoNestedService.CreateOptions,
  ): Promise<T>;
  async create(
    documentId: MongoAdapter.AnyId,
    input: any,
    options?: MongoNestedService.CreateOptions,
  ): Promise<PartialDTO<T>> {
    const command: MongoNestedService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId,
      input,
      options,
    };
    input[this.nestedKey] =
      input[this.nestedKey] == null || (input as any)[this.nestedKey] === ''
        ? this._generateId(command)
        : (input as any)[this.nestedKey];
    return this._executeCommand(command, async () => {
      const r = await this._create(command);
      if (!options?.projection) return r;
      const findCommand: MongoNestedService.FindOneCommand<T> = {
        crud: 'read',
        method: 'findById',
        byId: true,
        documentId,
        nestedId: r[this.nestedKey],
        options: {
          ...options,
          sort: undefined,
          filter: undefined,
          skip: undefined,
        },
      };
      const out = await this._findById(findCommand);
      if (out) return out;
    });
  }

  /**
   * Adds a single item into the array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {DTO<T>} input - The item to be added to the array field.
   * @param {MongoNestedService.CreateOptions} [options] - Optional options for the create operation.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves create operation result
   * @throws {ResourceNotAvailableError} - If the parent document is not found.
   */
  async createOnly(
    documentId: MongoAdapter.AnyId,
    input: DTO<T>,
    options?: MongoNestedService.CreateOptions,
  ): Promise<PartialDTO<T>> {
    const command: MongoNestedService.CreateCommand<T> = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId,
      input,
      options,
    };
    (input as any)[this.nestedKey] =
      (input as any)[this.nestedKey] == null ||
      (input as any)[this.nestedKey] === ''
        ? this._generateId(command)
        : (input as any)[this.nestedKey];
    return this._executeCommand(command, () => this._create(command));
  }

  protected async _create(
    command: MongoNestedService.CreateCommand<T>,
  ): Promise<T> {
    const inputCodec = this._getInputCodec('create');
    const { documentId, options } = command;
    const input: any = command.input;
    isNotNullish(input, { label: 'input' });
    isNotNullish(input[this.nestedKey], { label: `input.${this.nestedKey}` });
    const document: any = inputCodec(input);

    const docFilter = MongoAdapter.prepareKeyValues(documentId, ['_id']);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const update = {
      $push: { [this.fieldName]: document } as any,
    };
    const r = await collection.updateOne(docFilter, update, {
      ...options,
      session: options?.session ?? this.getSession(),
      upsert: undefined,
    });
    if (!r.matchedCount) {
      throw new ResourceNotAvailableError(this.getResourceName(), documentId);
    }
    return document;
  }

  /**
   * Counts the number of documents in the collection that match the specified parentId and options.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.CountOptions<T>} [options] - Optional parameters for counting.
   * @returns {Promise<number>} - A promise that resolves to the count of documents.
   */
  async count(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.CountOptions<T>,
  ): Promise<number> {
    const command: MongoNestedService.CountCommand<T> = {
      crud: 'read',
      method: 'count',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._count(command);
    });
  }

  protected async _count(
    command: MongoNestedService.CountCommand<T>,
  ): Promise<number> {
    const { documentId, options } = command;
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
    ];
    if (options?.filter) {
      const filter = MongoAdapter.prepareFilter(options?.filter);
      stages.push({ $match: filter });
    }
    stages.push({ $count: '*' });
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const cursor = collection.aggregate<T>(stages, {
      ...omit(options!, ['documentFilter', 'skip', 'limit', 'filter']),
      session: options?.session ?? this.getSession(),
    });
    try {
      const n = await cursor.next();
      return n?.['*'] || 0;
    } finally {
      await cursor.close();
    }
  }

  /**
   * Deletes an element from an array within a document in the MongoDB collection.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the element to delete from the nested array.
   * @param {MongoNestedService.DeleteOptions<T>} [options] - Additional options for the delete operation.
   * @return {Promise<number>} - A Promise that resolves to the number of elements deleted (1 if successful, 0 if not).
   */
  async delete(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.DeleteOptions<T>,
  ): Promise<number> {
    const command: MongoNestedService.DeleteCommand<T> = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._delete(command);
    });
  }

  protected async _delete(
    command: MongoNestedService.DeleteCommand<T>,
  ): Promise<number> {
    const { documentId, nestedId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    isNotNullish(documentId, { label: 'nestedId' });
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ])!;
    const pullFilter =
      MongoAdapter.prepareFilter([
        MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]),
        options?.filter,
      ]) || {};
    const update = {
      $pull: { [this.fieldName]: pullFilter } as any,
    };
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const r = await collection.updateOne(matchFilter, update, {
      ...options,
      session: options?.session ?? this.getSession(),
      upsert: undefined,
    });
    return r.modifiedCount ? 1 : 0;
  }

  /**
   * Deletes multiple items from a collection based on the parent ID and optional filter.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.DeleteManyOptions<T>} [options] - Optional options to specify a filter.
   * @returns {Promise<number>} - A Promise that resolves to the number of items deleted.
   */
  async deleteMany(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.DeleteManyOptions<T>,
  ): Promise<number> {
    const command: MongoNestedService.DeleteCommand<T> = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._deleteMany(command);
    });
  }

  protected async _deleteMany(
    command: MongoNestedService.DeleteCommand<T>,
  ): Promise<number> {
    const { documentId, options } = command;
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ])!;
    // Count matching items, we will use this as result
    const countCommand: MongoNestedService.CountCommand<T> = {
      crud: 'read',
      method: 'count',
      byId: false,
      documentId,
      options,
    };
    const matchCount = await this._count(countCommand);
    const pullFilter = MongoAdapter.prepareFilter(options?.filter) || {};
    const update = {
      $pull: { [this.fieldName]: pullFilter } as any,
    };
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    await collection.updateOne(matchFilter, update, {
      ...options,
      session: options?.session ?? this.getSession(),
      upsert: undefined,
    });
    return matchCount;
  }

  /**
   * Checks if an array element with the given parentId and id exists.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The id of the record.
   * @param {MongoNestedService.ExistsOptions<T>} [options] - The options for the exists method.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the record exists or not.
   */
  async exists(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.ExistsOptions<T>,
  ): Promise<boolean> {
    const command: MongoNestedService.ExistsCommand<T> = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        documentFilter,
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter };
      return !!(await this._findById(command));
    });
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.ExistsOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.ExistsOptions<T>,
  ): Promise<boolean> {
    const command: MongoNestedService.ExistsCommand<T> = {
      crud: 'read',
      method: 'exists',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = MongoAdapter.prepareFilter([
        documentFilter,
        command.options?.filter,
      ]);
      const findCommand = command as MongoNestedService.FindOneCommand<T>;
      findCommand.options = {
        ...command.options,
        filter,
        documentFilter,
        projection: ['_id'],
      };
      return !!(await this._findOne(findCommand));
    });
  }

  /**
   * Finds an element in array field by its parent ID and ID.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the document.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - The optional options for the operation.
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async findById(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options: RequiredSome<MongoNestedService.FindOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async findById(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<T | undefined>;
  async findById(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const command: MongoNestedService.FindOneCommand<T> = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._findById(command);
    });
  }

  protected async _findById(
    command: MongoNestedService.FindOneCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const { documentId, nestedId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    isNotNullish(nestedId, { label: 'nestedId' });
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]),
      options?.filter,
    ]);
    const findManyCommand: MongoNestedService.FindManyCommand<T> = {
      ...command,
      options: {
        ...options,
        filter,
        limit: 1,
        skip: undefined,
        sort: undefined,
      },
    };
    const rows = await this._findMany(findManyCommand);
    return rows?.[0];
  }

  /**
   * Finds the first array element that matches the given parentId.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - Optional options to customize the query.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the first matching document, or `undefined` if no match is found.
   */
  async findOne(
    documentId: MongoAdapter.AnyId,
    options: RequiredSome<MongoNestedService.FindOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async findOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<T | undefined>;
  async findOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | T | undefined> {
    const command: MongoNestedService.FindOneCommand<T> = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._findOne(command);
    });
  }

  protected async _findOne(
    command: MongoNestedService.FindOneCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const { documentId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    const findManyCommand: MongoNestedService.FindManyCommand<T> = {
      ...command,
      options: {
        ...options,
        limit: 1,
      },
    };
    const rows = await this._findMany(findManyCommand);
    return rows?.[0];
  }

  /**
   * Finds multiple elements in an array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.FindManyOptions<T>} [options] - The options for finding the documents.
   * @returns {Promise<PartialDTO<T>[]>} - The found documents.
   */
  async findMany(
    documentId: MongoAdapter.AnyId,
    options: RequiredSome<MongoNestedService.FindManyOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T>[]>;
  async findMany(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<T[]>;
  async findMany(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<(PartialDTO<T> | T)[]> {
    const command: MongoNestedService.FindManyCommand<T> = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const nestedFilter = await this._getNestedFilter(command);
      command.options = {
        ...command.options,
        nestedFilter,
        documentFilter,
        limit: command.options?.limit || this.defaultLimit,
      };
      return this._findMany(command);
    });
  }

  protected async _findMany(
    command: MongoNestedService.FindManyCommand<T>,
  ): Promise<PartialDTO<T>[]> {
    const { documentId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    const limit = options?.limit || this.defaultLimit;
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
    ];
    /** Pre-Stages */
    if (options?.preStages) stages.push(...options.preStages);
    /** Filter */
    if (options?.filter || options?.nestedFilter) {
      const optionsFilter = MongoAdapter.prepareFilter([
        options?.filter,
        options.nestedFilter,
      ]);
      stages.push({ $match: optionsFilter });
    }
    /** Sort */
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) stages.push({ $sort: sort });
    }
    /** Skip */
    if (options?.skip) stages.push({ $skip: options.skip });
    /** Limit */
    stages.push({ $limit: limit });

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(
      dataType,
      options?.projection,
      this._dataTypeScope,
    );
    if (projection) stages.push({ $project: projection });
    /** Post-Stages */
    if (options?.postStages) stages.push(...options.postStages);

    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const cursor = collection.aggregate<T>(stages, {
      ...omit(options!, [
        'documentFilter',
        'nestedFilter',
        'projection',
        'sort',
        'skip',
        'limit',
        'filter',
      ]),
      session: options?.session ?? this.getSession(),
    });
    try {
      const outputCodec = this._getOutputCodec('find');
      return (await cursor.toArray()).map((r: any) => outputCodec(r));
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Finds multiple elements in an array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.FindManyOptions<T>} [options] - The options for finding the documents.
   * @returns {Promise<PartialDTO<T>[]>} - The found documents.
   */
  async findManyWithCount(
    documentId: MongoAdapter.AnyId,
    options: RequiredSome<MongoNestedService.FindManyOptions<T>, 'projection'>,
  ): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }>;
  async findManyWithCount(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<{
    count: number;
    items: T[];
  }>;
  async findManyWithCount(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<{
    count: number;
    items: (PartialDTO<T> | T)[];
  }> {
    const command: MongoNestedService.FindManyCommand<T> = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      documentId,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const nestedFilter = await this._getNestedFilter(command);
      command.options = {
        ...command.options,
        nestedFilter,
        documentFilter,
        limit: command.options?.limit || this.defaultLimit,
      };
      return this._findManyWithCount(command);
    });
  }

  protected async _findManyWithCount(
    command: MongoNestedService.FindManyCommand<T>,
  ): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const { documentId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    const limit = options?.limit || this.defaultLimit;
    const dataStages: mongodb.Document[] = [];
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
      {
        $facet: {
          data: dataStages,
          count: [{ $count: 'totalMatches' }],
        },
      },
    ];

    /** Pre-Stages */
    if (options?.preStages) dataStages.push(...options.preStages);
    /** Filter */
    if (options?.filter || options?.nestedFilter) {
      const optionsFilter = MongoAdapter.prepareFilter([
        options?.filter,
        options?.nestedFilter,
      ]);
      dataStages.push({ $match: optionsFilter });
    }
    /** Sort */
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) dataStages.push({ $sort: sort });
    }
    /** Skip */
    if (options?.skip) dataStages.push({ $skip: options.skip });
    /** Limit */
    dataStages.push({ $limit: limit });
    /** Post-Stages */
    if (options?.postStages) dataStages.push(...options.postStages);

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(
      dataType,
      options?.projection,
      this._dataTypeScope,
    );
    if (projection) dataStages.push({ $project: projection });
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const cursor = collection.aggregate<T>(stages, {
      ...omit(options!, [
        'documentFilter',
        'nestedFilter',
        'projection',
        'sort',
        'skip',
        'limit',
        'filter',
      ]),
      session: options?.session ?? this.getSession(),
    });
    try {
      const facetResult = await cursor.toArray();
      const outputCodec = this._getOutputCodec('find');
      return {
        count: facetResult[0].count[0].totalMatches || 0,
        items: facetResult[0].data.map((r: any) => outputCodec(r)),
      };
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Retrieves a specific item from the array of a document.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the item.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - The options for finding the item.
   * @returns {Promise<PartialDTO<T>>} - The item found.
   * @throws {ResourceNotAvailableError} - If the item is not found.
   */
  async get(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options: RequiredSome<MongoNestedService.FindOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T>>;
  async get(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<T>;
  async get(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | T> {
    const out = await this.findById(documentId, nestedId, options);
    if (!out) {
      throw new ResourceNotAvailableError(
        this.getResourceName() + '.' + this.nestedKey,
        documentId + '/' + nestedId,
      );
    }
    return out;
  }

  /**
   * Updates an array element with new data and returns the updated element
   *
   * @param {AnyId} documentId - The ID of the document to update.
   * @param {AnyId} nestedId - The ID of the item to update within the document.
   * @param {MongoPatchDTO<T>} input - The new data to update the item with.
   * @param {MongoNestedService.UpdateOneOptions<T>} [options] - Additional update options.
   * @returns {Promise<PartialDTO<T> | undefined>} The updated item or undefined if it does not exist.
   * @throws {Error} If an error occurs while updating the item.
   */
  async update(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: MongoPatchDTO<T>,
    options: RequiredSome<MongoNestedService.UpdateOneOptions<T>, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  async update(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: MongoPatchDTO<T>,
    options?: MongoNestedService.UpdateOneOptions<T>,
  ): Promise<T | undefined>;
  async update(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: MongoPatchDTO<T>,
    options?: MongoNestedService.UpdateOneOptions<T>,
  ): Promise<PartialDTO<T> | T | undefined> {
    const command: MongoNestedService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      byId: true,
      documentId,
      nestedId,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = {
        ...command.options,
        filter,
        documentFilter,
      };
      const matchCount = await this._updateOnly(command);
      if (matchCount) {
        const findCommand: MongoNestedService.FindOneCommand<T> = {
          crud: 'read',
          method: 'findById',
          byId: true,
          documentId,
          nestedId,
          options: { ...options, sort: undefined },
        };
        const out = this._findById(findCommand);
        if (out) return out;
      }
      throw new ResourceNotAvailableError(
        this.getResourceName() + '.' + this.nestedKey,
        documentId + '/' + nestedId,
      );
    });
  }

  /**
   * Update an array element with new data. Returns 1 if document updated 0 otherwise.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the document to update.
   * @param {MongoPatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {MongoNestedService.UpdateOneOptions<T>} [options] - Optional update options.
   * @returns {Promise<number>} - A promise that resolves to the number of elements updated.
   */
  async updateOnly(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: MongoPatchDTO<T>,
    options?: MongoNestedService.UpdateOneOptions<T>,
  ): Promise<number> {
    const command: MongoNestedService.UpdateOneCommand<T> = {
      crud: 'update',
      method: 'update',
      byId: true,
      documentId,
      nestedId,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = {
        ...command.options,
        filter,
        documentFilter,
      };
      return await this._updateOnly(command);
    });
  }

  protected async _updateOnly(
    command: MongoNestedService.UpdateOneCommand<T>,
  ): Promise<number> {
    const { documentId, nestedId, options } = command;
    isNotNullish(documentId, { label: 'documentId' });
    isNotNullish(nestedId, { label: 'nestedId' });
    let filter = MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]);
    if (options?.filter)
      filter = MongoAdapter.prepareFilter([filter, options?.filter])!;
    const updateManyCommand: MongoNestedService.UpdateManyCommand<T> = {
      ...command,
      options: {
        ...command.options,
        filter,
      },
    };
    return await this._updateMany(updateManyCommand);
  }

  /**
   * Updates multiple array elements in document
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document to update.
   * @param {MongoPatchDTO<T>} input - The updated data for the document(s).
   * @param {MongoNestedService.UpdateManyOptions<T>} [options] - Additional options for the update operation.
   * @returns {Promise<number>} - A promise that resolves to the number of documents updated.
   */
  async updateMany(
    documentId: MongoAdapter.AnyId,
    input: MongoPatchDTO<T>,
    options?: MongoNestedService.UpdateManyOptions<T>,
  ): Promise<number> {
    const command: MongoNestedService.UpdateManyCommand<T> = {
      crud: 'update',
      method: 'updateMany',
      documentId,
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = MongoAdapter.prepareFilter([
        await this._getDocumentFilter(command),
      ]);
      const filter = MongoAdapter.prepareFilter([
        await this._getNestedFilter(command),
        command.options?.filter,
      ]);
      command.options = { ...command.options, filter, documentFilter };
      return this._updateMany(command);
    });
  }

  protected async _updateMany(
    command: MongoNestedService.UpdateManyCommand<T>,
  ): Promise<number> {
    const { documentId, input } = command;
    isNotNullish(documentId, { label: 'documentId' });
    const options = { ...command.options };
    const inputCodec = this._getInputCodec('update');
    const doc = inputCodec(input);
    if (!Object.keys(doc).length) return 0;
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
      { [this.fieldName]: { $exists: true } },
    ])!;
    if (options?.filter) {
      const elemMatch = MongoAdapter.prepareFilter([options?.filter], {
        fieldPrefix: 'elem.',
      })!;
      options.arrayFilters = [elemMatch];
    }
    const patchGenerator = new MongoPatchGenerator();
    const { update, arrayFilters } = patchGenerator.generatePatch<T>(
      this.dataType,
      doc,
      {
        currentPath: this.fieldName + (options?.filter ? '.$[elem]' : '.$[]'),
      },
    );
    command.options = command.options || {};
    if (arrayFilters) {
      command.options.arrayFilters = command.options.arrayFilters || [];
      command.options.arrayFilters.push(arrayFilters);
    }
    // Count matching items, we will use this as result
    const count = await this._count({
      crud: 'read',
      method: 'count',
      byId: false,
      documentId,
      options,
    });
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    await collection.updateOne(matchFilter, update, {
      ...options,
      session: options?.session ?? this.getSession(),
      upsert: undefined,
    });
    return count;
  }

  /**
   * Retrieves the common filter used for querying array elements.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {MongoAdapter.FilterInput | Promise<MongoAdapter.FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getNestedFilter(
    args: MongoService.CommandInfo,
  ): MongoAdapter.FilterInput | Promise<MongoAdapter.FilterInput> | undefined {
    return typeof this.nestedFilter === 'function'
      ? this.nestedFilter(args, this)
      : this.nestedFilter;
  }

  protected override async _executeCommand(
    command: MongoEntityService.CommandInfo,
    commandFn: () => any,
  ): Promise<any> {
    try {
      const result = await super._executeCommand(command, async () => {
        /** Call before[X] hooks */
        if (command.crud === 'create')
          await this._beforeCreate(
            command as MongoNestedService.CreateCommand<T>,
          );
        else if (command.crud === 'update' && command.byId) {
          await this._beforeUpdate(
            command as MongoNestedService.UpdateOneCommand<T>,
          );
        } else if (command.crud === 'update' && !command.byId) {
          await this._beforeUpdateMany(
            command as MongoNestedService.UpdateManyCommand<T>,
          );
        } else if (command.crud === 'delete' && command.byId) {
          await this._beforeDelete(
            command as MongoNestedService.DeleteCommand<T>,
          );
        } else if (command.crud === 'delete' && !command.byId) {
          await this._beforeDeleteMany(
            command as MongoNestedService.DeleteCommand<T>,
          );
        }
        /** Call command function */
        return commandFn();
      });
      /** Call after[X] hooks */
      if (command.crud === 'create')
        await this._afterCreate(
          command as MongoNestedService.CreateCommand<T>,
          result,
        );
      else if (command.crud === 'update' && command.byId) {
        await this._afterUpdate(
          command as MongoNestedService.UpdateOneCommand<T>,
          result,
        );
      } else if (command.crud === 'update' && !command.byId) {
        await this._afterUpdateMany(
          command as MongoNestedService.UpdateManyCommand<T>,
          result,
        );
      } else if (command.crud === 'delete' && command.byId) {
        await this._afterDelete(
          command as MongoNestedService.DeleteCommand<T>,
          result,
        );
      } else if (command.crud === 'delete' && !command.byId) {
        await this._afterDeleteMany(
          command as MongoNestedService.DeleteCommand<T>,
          result,
        );
      }
      return result;
    } catch (e: any) {
      Error.captureStackTrace(e, this._executeCommand);
      await this.onError?.(e, this);
      throw e;
    }
  }

  protected async _beforeCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.CreateCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.UpdateOneCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.UpdateManyCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.DeleteCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.DeleteCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.CreateCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.UpdateOneCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result?: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.UpdateManyCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.DeleteCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoNestedService.DeleteCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }
}
