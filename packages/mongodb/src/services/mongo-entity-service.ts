import { omit } from '@jsopen/objects';
import { InternalServerError } from '@opra/common';
import mongodb, { type UpdateFilter } from 'mongodb';
import type { PartialDTO, StrictOmit, Type } from 'ts-gems';
import { isNotNullish } from 'valgen';
import { MongoAdapter } from '../adapter/mongo-adapter.js';
import { MongoPatchGenerator } from '../adapter/mongo-patch-generator.js';
import type { MongoPatchDTO } from '../types.js';
import { MongoService } from './mongo-service.js';

/**
 *
 * @namespace MongoEntityService
 */
export namespace MongoEntityService {
  /**
   * The constructor options of MongoEntityService.
   *
   * @interface Options
   * @extends MongoService.Options
   */
  export interface Options extends MongoService.Options {}

  export interface CommandInfo extends MongoService.CommandInfo {}

  export interface CreateOptions extends MongoService.CreateOptions {}

  export interface CountOptions<T> extends MongoService.CountOptions<T> {}

  export interface DeleteOptions<T> extends MongoService.DeleteOptions<T> {}

  export interface DeleteManyOptions<T>
    extends MongoService.DeleteManyOptions<T> {}

  export interface DistinctOptions<T> extends MongoService.DistinctOptions<T> {}

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface FindOneOptions<T> extends MongoService.FindOneOptions<T> {}

  export interface FindManyOptions<T> extends MongoService.FindManyOptions<T> {
    noDecode?: boolean;
  }

  export interface ReplaceOptions<T> extends MongoService.ReplaceOptions<T> {}

  export interface UpdateOneOptions<T>
    extends MongoService.UpdateOneOptions<T> {
    initArrayFields?: string[];
  }

  export interface UpdateManyOptions<T>
    extends MongoService.UpdateManyOptions<T> {
    initArrayFields?: string[];
  }

  export interface CreateCommand<T>
    extends StrictOmit<CommandInfo, 'documentId' | 'nestedId' | 'input'> {
    crud: 'create';
    input: PartialDTO<T>;
    options?: CreateOptions;
  }

  export interface CountCommand<T>
    extends StrictOmit<CommandInfo, 'documentId' | 'nestedId' | 'input'> {
    crud: 'read';
    options?: CountOptions<T>;
  }

  export interface DeleteCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'delete';
    options?: DeleteOptions<T>;
  }

  export interface DistinctCommand<T>
    extends StrictOmit<CommandInfo, 'documentId' | 'nestedId' | 'input'> {
    crud: 'read';
    field: string;
    options?: DistinctOptions<T>;
  }

  export interface ExistsCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: ExistsOptions<T>;
  }

  export interface FindOneCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: FindOneOptions<T>;
  }

  export interface FindManyCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: FindManyOptions<T>;
  }

  export interface UpdateOneCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId'> {
    crud: 'update';
    input?: MongoPatchDTO<T>;
    inputRaw?: mongodb.UpdateFilter<T>;
    options?: UpdateOneOptions<T>;
  }

  export interface UpdateManyCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId'> {
    crud: 'update';
    input?: MongoPatchDTO<T>;
    inputRaw?: mongodb.UpdateFilter<T>;
    options?: UpdateManyOptions<T>;
  }

  export interface ReplaceCommand<T>
    extends StrictOmit<CommandInfo, 'nestedId'> {
    crud: 'replace';
    input: PartialDTO<T>;
    options?: ReplaceOptions<T>;
  }
}

/**
 * @class MongoEntityService
 * @template T - The type of the documents in the collection
 */
export class MongoEntityService<
  T extends mongodb.Document,
> extends MongoService<T> {
  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoEntityService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoEntityService.Options) {
    super(dataType, options);
  }

  /**
   * Creates a new document in the MongoDB collection
   *
   * @param {MongoEntityService.CreateCommand} command
   * @protected
   */
  protected async _create(
    command: MongoEntityService.CreateCommand<T>,
  ): Promise<T> {
    const input: any = command.input;
    isNotNullish(input, { label: 'input' });
    isNotNullish(input._id, { label: 'input._id' });
    const inputCodec = this._getInputCodec('create');
    const document: any = inputCodec(input);
    const { options } = command;
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const r = await collection.insertOne(document, {
      ...options,
      session: options?.session ?? this.getSession(),
    });
    /* istanbul ignore next */
    if (!r.insertedId) {
      throw new InternalServerError(
        `Unknown error while creating document for "${this.getResourceName()}"`,
      );
    }
    return document;
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoEntityService.CountCommand<T>} command
   * @protected
   */
  protected async _count(
    command: MongoEntityService.CountCommand<T>,
  ): Promise<number> {
    const { options } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    return (
      (await collection.countDocuments(filter || {}, {
        ...options,
        limit: undefined,
        session: options?.session ?? this.getSession(),
      })) || 0
    );
  }

  /**
   * Deletes a document from the collection
   *
   * @param {MongoEntityService.DeleteCommand<T>} command
   * @protected
   */
  protected async _delete(
    command: MongoEntityService.DeleteCommand<T>,
  ): Promise<number> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { options } = command;
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      options?.filter,
    ]);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const session = options?.session ?? this.getSession();
    return (
      await collection.deleteOne(filter || {}, {
        ...options,
        session,
      })
    ).deletedCount;
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoEntityService.DeleteCommand<T>} command
   * @protected
   */
  protected async _deleteMany(
    command: MongoEntityService.DeleteCommand<T>,
  ): Promise<number> {
    const { options } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    return (
      await collection.deleteMany(filter || {}, {
        ...options,
        session: options?.session ?? this.getSession(),
      })
    ).deletedCount;
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection
   *
   * @param {MongoEntityService.DistinctCommand<T>} command
   * @protected
   */
  protected async _distinct(
    command: MongoEntityService.DistinctCommand<T>,
  ): Promise<any[]> {
    const { options, field } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    return await collection.distinct(field, filter || {}, {
      ...options,
      session: options?.session ?? this.getSession(),
    });
  }

  /**
   * Finds a document by its ID.
   *
   * @param { MongoEntityService.FindOneCommand<T>} command
   */
  protected async _findById(
    command: MongoEntityService.FindOneCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      command.options?.filter,
    ]);
    const { options } = command;
    const findManyCommand: MongoEntityService.FindManyCommand<T> = {
      ...command,
      options: {
        ...options,
        filter,
        limit: 1,
        skip: undefined,
      },
    };
    const rows = await this._findMany(findManyCommand);
    return rows?.[0];
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoEntityService.FindOneCommand<T>} command
   */
  protected async _findOne(
    command: MongoEntityService.FindOneCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const { options } = command;
    const findManyCommand: MongoEntityService.FindManyCommand<T> = {
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
   * Finds multiple documents in the MongoDB collection
   *
   * @param {MongoEntityService.FindManyCommand<T>} command
   */
  protected async _findMany(
    command: MongoEntityService.FindManyCommand<T>,
  ): Promise<PartialDTO<T>[]> {
    const { options } = command;
    const stages: mongodb.Document[] = [];
    /** Pre-Stages */
    if (options?.preStages) stages.push(...options.preStages);
    /** "Filter" stage */
    let filter: mongodb.Filter<T> | undefined;
    if (options?.filter)
      filter = MongoAdapter.prepareFilter<T>(options?.filter);
    if (filter) stages.push({ $match: filter });
    /** "Skip" stage */
    if (options?.skip) stages.push({ $skip: options.skip });
    /** "Sort" stage */
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) stages.push({ $sort: sort });
    }
    /** "Limit" stage */
    stages.push({ $limit: options?.limit || 10 });
    /** Post-Stages */
    if (options?.postStages) stages.push(...options.postStages);

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(
      dataType,
      options?.projection,
      this._dataTypeScope,
    );
    if (projection) stages.push({ $project: projection });
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const cursor = collection.aggregate<T>(stages, {
      ...omit(options!, ['projection', 'sort', 'skip', 'limit', 'filter']),
      session: options?.session ?? this.getSession(),
    });
    /** Execute db command */
    try {
      /** Fetch the cursor */
      if (options?.noDecode) return cursor.toArray();
      /** Decode result objects */
      const outputCodec = this._getOutputCodec('find');
      return (await cursor.toArray()).map((r: any) => outputCodec(r));
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {MongoEntityService.FindManyCommand<T>} command
   */
  protected async _findManyWithCount(
    command: MongoEntityService.FindManyCommand<T>,
  ): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const { options } = command;
    const limit = options?.limit || 10;
    let filter: mongodb.Filter<T> | undefined;
    if (options?.filter)
      filter = MongoAdapter.prepareFilter<T>(options?.filter);

    const dataStages: mongodb.Document[] = [];
    const countStages: any[] = [];
    const stages: mongodb.Document[] = [
      {
        $facet: {
          data: dataStages,
          count: countStages,
        },
      },
    ];

    /** Pre-Stages */
    if (options?.preStages) dataStages.push(...options.preStages);

    /** Filter */
    if (filter) {
      countStages.push({ $match: filter });
      dataStages.push({ $match: filter });
    }
    countStages.push({ $count: 'totalMatches' });

    /** Sort */
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) dataStages.push({ $sort: sort });
    }
    /** Skip */
    if (options?.skip) dataStages.push({ $skip: options.skip });
    /** Limit */
    dataStages.push({ $limit: limit });

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(
      dataType,
      options?.projection,
      this._dataTypeScope,
    );
    if (projection) dataStages.push({ $project: projection });
    const outputCodec = this._getOutputCodec('find');
    /** Execute db command */
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const cursor = collection.aggregate<T>(stages, {
      ...omit(options!, ['projection', 'sort', 'skip', 'limit', 'filter']),
      session: options?.session ?? this.getSession(),
    });
    /** Fetch the cursor and decode the result objects */
    try {
      const facetResult = await cursor.toArray();
      return {
        count: facetResult[0].count[0]?.totalMatches || 0,
        items: options?.noDecode
          ? facetResult[0].data
          : facetResult[0].data?.map((r: any) => outputCodec(r)),
      };
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Updates a document with the given id in the collection
   *
   * @param {MongoEntityService.UpdateOneCommand<T>} command
   */
  protected async _update(
    command: MongoEntityService.UpdateOneCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { input, inputRaw } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError(
        'You must pass one of MongoDB UpdateFilter or a partial document, not both',
      );
    }
    const update = this._prepareUpdate(command);
    const options = command.options;
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId!, ['_id']),
      options?.filter,
    ]);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const out = await collection.findOneAndUpdate(filter || {}, update, {
      upsert: undefined,
      ...options,
      returnDocument: 'after',
      includeResultMetadata: false,
      session: options?.session ?? this.getSession(),
      projection: MongoAdapter.prepareProjection(
        this.dataType,
        options?.projection,
        this._dataTypeScope,
      ),
    });
    const outputCodec = this._getOutputCodec('update');
    if (out) return outputCodec(out);
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {MongoEntityService.UpdateOneCommand<T>} command
   */
  protected async _updateOnly(
    command: MongoEntityService.UpdateOneCommand<T>,
  ): Promise<number> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { input, inputRaw } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError(
        'You must pass one of MongoDB UpdateFilter or a partial document, not both',
      );
    }
    const update = this._prepareUpdate(command);
    const options = command.options;
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      options?.filter,
    ]);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    /** Create array fields if not exists */
    if (options?.initArrayFields) {
      const $set = options.initArrayFields.reduce((a, k) => {
        a[k] = { $ifNull: ['$' + k, []] };
        return a;
      }, {} as any);
      await collection.updateOne(filter || {}, [{ $set }], {
        ...options,
        session: options?.session ?? this.getSession(),
        arrayFilters: undefined,
        upsert: false,
      });
      delete options.initArrayFields;
    }
    /** Execute update operation */
    return (
      await collection.updateOne(filter || {}, update, {
        ...options,
        session: options?.session ?? this.getSession(),
        upsert: undefined,
      })
    ).matchedCount;
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {MongoEntityService.UpdateManyCommand<T>} command
   */
  protected async _updateMany(
    command: MongoEntityService.UpdateManyCommand<T>,
  ): Promise<number> {
    isNotNullish(command.input, { label: 'input' });
    const { input, inputRaw } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError(
        'You must pass one of MongoDB UpdateFilter or a partial document, not both',
      );
    }
    const update = this._prepareUpdate(command);
    const options = command.options;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    /** Create array fields if not exists */
    if (options?.initArrayFields) {
      const $set = options.initArrayFields.reduce((a, k) => {
        a[k] = { $ifNull: ['$' + k, []] };
        return a;
      }, {} as any);
      await collection.updateMany(filter || {}, [{ $set }], {
        ...omit(options!, ['filter']),
        session: options?.session ?? this.getSession(),
        arrayFilters: undefined,
        upsert: false,
      });
      delete options.initArrayFields;
    }
    /** Execute update operation */
    return (
      await collection.updateMany(filter || {}, update, {
        ...omit(options!, ['filter']),
        session: options?.session ?? this.getSession(),
        upsert: false,
      })
    ).matchedCount;
  }

  /**
   * Replaces a document with the given id in the collection
   *
   * @param {MongoEntityService.ReplaceCommand<T>} command
   */
  protected async _replace(
    command: MongoEntityService.ReplaceCommand<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const input: any = command.input;
    isNotNullish(input, { label: 'input' });
    isNotNullish(input._id, { label: 'input._id' });
    const inputCodec = this._getInputCodec('replace');
    const document: any = inputCodec(input);
    const { options } = command;

    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId!, ['_id']),
      options?.filter,
    ]);
    const db = this.getDatabase();
    const collection = await this.getCollection(db);
    const out = await collection.findOneAndReplace(filter || {}, document, {
      upsert: undefined,
      ...options,
      returnDocument: 'after',
      includeResultMetadata: false,
      session: options?.session ?? this.getSession(),
      projection: MongoAdapter.prepareProjection(
        this.dataType,
        options?.projection,
        this._dataTypeScope,
      ),
    });
    const outputCodec = this._getOutputCodec('replace');
    if (out) return outputCodec(out);
  }

  protected _prepareUpdate(
    command:
      | MongoEntityService.UpdateOneCommand<T>
      | MongoEntityService.UpdateManyCommand<T>,
  ): UpdateFilter<T> {
    const { input, inputRaw } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError(
        'You must pass one of MongoDB UpdateFilter or a partial document, not both',
      );
    }
    if (inputRaw) return inputRaw;
    const inputCodec = this._getInputCodec('update');
    const doc = inputCodec(input!);
    delete doc._id;
    if (doc!._$push) {
      (doc as any)._$push = inputCodec(doc!._$push);
    }
    return this._generatePatch(command, doc);
  }

  protected _generatePatch(
    command:
      | MongoEntityService.UpdateOneCommand<T>
      | MongoEntityService.UpdateManyCommand<T>,
    doc: any,
  ) {
    const patchGenerator = new MongoPatchGenerator();
    const { update, arrayFilters, initArrayFields } =
      patchGenerator.generatePatch<T>(this.dataType, doc, {
        scope: this._dataTypeScope,
      });
    command.options = command.options || {};
    if (arrayFilters) {
      command.options.arrayFilters = command.options.arrayFilters || [];
      command.options.arrayFilters.push(...arrayFilters);
      command.options.initArrayFields = initArrayFields;
    }
    return update;
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
            command as MongoEntityService.CreateCommand<T>,
          );
        else if (command.crud === 'delete' && command.byId) {
          await this._beforeDelete(
            command as MongoEntityService.DeleteCommand<T>,
          );
        } else if (command.crud === 'delete' && !command.byId) {
          await this._beforeDeleteMany(
            command as MongoEntityService.DeleteCommand<T>,
          );
        } else if (command.crud === 'replace') {
          await this._beforeReplace(
            command as MongoEntityService.ReplaceCommand<T>,
          );
        } else if (command.crud === 'update' && command.byId) {
          await this._beforeUpdate(
            command as MongoEntityService.UpdateOneCommand<T>,
          );
        } else if (command.crud === 'update' && !command.byId) {
          await this._beforeUpdateMany(
            command as MongoEntityService.UpdateManyCommand<T>,
          );
        }
        /** Call command function */
        return commandFn();
      });
      /** Call after[X] hooks */
      if (command.crud === 'create')
        await this._afterCreate(
          command as MongoEntityService.CreateCommand<T>,
          result,
        );
      else if (command.crud === 'delete' && command.byId) {
        await this._afterDelete(
          command as MongoEntityService.DeleteCommand<T>,
          result,
        );
      } else if (command.crud === 'delete' && !command.byId) {
        await this._afterDeleteMany(
          command as MongoEntityService.DeleteCommand<T>,
          result,
        );
      } else if (command.crud === 'replace') {
        await this._afterReplace(
          command as MongoEntityService.ReplaceCommand<T>,
          result,
        );
      } else if (command.crud === 'update' && command.byId) {
        await this._afterUpdate(
          command as MongoEntityService.UpdateOneCommand<T>,
          result,
        );
      } else if (command.crud === 'update' && !command.byId) {
        await this._afterUpdateMany(
          command as MongoEntityService.UpdateManyCommand<T>,
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
    command: MongoEntityService.CreateCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.DeleteCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.DeleteCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeReplace(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.ReplaceCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.UpdateOneCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.UpdateManyCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.CreateCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterReplace(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.ReplaceCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.DeleteCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.DeleteCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.UpdateOneCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result?: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: MongoEntityService.UpdateManyCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }
}
