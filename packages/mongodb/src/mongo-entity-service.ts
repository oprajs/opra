import { InternalServerError } from '@opra/common';
import omit from 'lodash.omit';
import mongodb, { UpdateFilter } from 'mongodb';
import { PartialDTO, PatchDTO, RequiredSome, StrictOmit, Type } from 'ts-gems';
import { isNotNullish } from 'valgen';
import { MongoAdapter } from './mongo-adapter.js';
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

  export interface DeleteManyOptions<T> extends MongoService.DeleteManyOptions<T> {}

  export interface DistinctOptions<T> extends MongoService.DistinctOptions<T> {}

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface FindOneOptions<T> extends MongoService.FindOneOptions<T> {}

  export interface FindManyOptions<T> extends MongoService.FindManyOptions<T> {}

  export interface UpdateOneOptions<T> extends MongoService.UpdateOneOptions<T> {}

  export interface UpdateManyOptions<T> extends MongoService.UpdateManyOptions<T> {}

  export interface CreateCommand extends StrictOmit<RequiredSome<CommandInfo, 'input'>, 'documentId' | 'nestedId'> {
    crud: 'create';
    options?: CreateOptions;
  }

  export interface CountCommand<T> extends StrictOmit<CommandInfo, 'documentId' | 'nestedId' | 'input'> {
    crud: 'read';
    options?: CountOptions<T>;
  }

  export interface DeleteCommand<T> extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'delete';
    options?: DeleteOptions<T>;
  }

  export interface DistinctCommand<T> extends StrictOmit<CommandInfo, 'documentId' | 'nestedId' | 'input'> {
    crud: 'read';
    field: string;
    options?: DistinctOptions<T>;
  }

  export interface ExistsCommand<T> extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: ExistsOptions<T>;
  }

  export interface FindOneCommand<T> extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: FindOneOptions<T>;
  }

  export interface FindManyCommand<T> extends StrictOmit<CommandInfo, 'nestedId' | 'input'> {
    crud: 'read';
    options?: FindManyOptions<T>;
  }

  export interface UpdateOneCommand<T> extends StrictOmit<CommandInfo, 'nestedId'> {
    crud: 'update';
    input?: PatchDTO<T>;
    inputRaw?: mongodb.UpdateFilter<T>;
    options?: UpdateOneOptions<T>;
  }

  export interface UpdateManyCommand<T> extends StrictOmit<CommandInfo, 'nestedId'> {
    crud: 'update';
    input?: PatchDTO<T>;
    inputRaw?: mongodb.UpdateFilter<T>;
    options?: UpdateManyOptions<T>;
  }
}

/**
 * @class MongoEntityService
 * @template T - The type of the documents in the collection.
 */
export class MongoEntityService<T extends mongodb.Document> extends MongoService<T> {
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
   * Creates a new document in the MongoDB collection.
   *
   * @param {MongoEntityService.CreateCommand} command
   * @protected
   */
  protected async _create(command: MongoEntityService.CreateCommand): Promise<PartialDTO<T>> {
    isNotNullish(command.input, { label: 'input' });
    isNotNullish(command.input._id, { label: 'input._id' });
    const inputCodec = this.getInputCodec('create');
    const doc: any = inputCodec(command.input);
    const { options } = command;
    const r = await this._dbInsertOne(doc, options);
    if (r.insertedId) {
      if (!command.options) return doc;
      const findCommand: MongoEntityService.FindOneCommand<T> = {
        ...command,
        crud: 'read',
        byId: true,
        documentId: doc._id,
        options: omit(options, 'filter'),
      };
      const out = await this._findById(findCommand);
      if (out) return out;
    }
    /* istanbul ignore next */
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoEntityService.CountCommand<T>} command
   * @protected
   */
  protected async _count(command: MongoEntityService.CountCommand<T>): Promise<number> {
    const { options } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return this._dbCountDocuments(filter, omit(options, 'filter'));
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {MongoEntityService.DeleteCommand<T>} command
   * @protected
   */
  protected async _delete(command: MongoEntityService.DeleteCommand<T>): Promise<number> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { options } = command;
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      options?.filter,
    ]);
    const r = await this._dbDeleteOne(filter, options);
    return r.deletedCount;
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoEntityService.DeleteCommand<T>} command
   * @protected
   */
  protected async _deleteMany(command: MongoEntityService.DeleteCommand<T>): Promise<number> {
    const { options } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this._dbDeleteMany(filter, omit(options, 'filter'));
    return r.deletedCount;
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   *
   * @param {MongoEntityService.DistinctCommand<T>} command
   * @protected
   */
  protected async _distinct(command: MongoEntityService.DistinctCommand<T>): Promise<any[]> {
    const { options, field } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return await this._dbDistinct(field, filter, omit(options, 'filter'));
  }

  /**
   * Finds a document by its ID.
   *
   * @param { MongoEntityService.FindOneCommand<T>} command
   */
  protected async _findById(command: MongoEntityService.FindOneCommand<T>): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      command.options?.filter,
    ]);
    const { options } = command;
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      projection: MongoAdapter.prepareProjection(this.dataType, options?.projection),
      limit: undefined,
      skip: undefined,
      sort: undefined,
    };
    const out = await this._dbFindOne(filter, mongoOptions);
    const outputCodec = this.getOutputCodec('find');
    if (out) return outputCodec(out);
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoEntityService.FindOneCommand<T>} command
   */
  protected async _findOne(command: MongoEntityService.FindOneCommand<T>): Promise<PartialDTO<T> | undefined> {
    const { options } = command;
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const mongoOptions: mongodb.FindOptions = {
      ...omit(options, 'filter'),
      sort: options?.sort ? MongoAdapter.prepareSort(options.sort) : undefined,
      projection: MongoAdapter.prepareProjection(this.dataType, options?.projection),
      limit: undefined,
    };
    const out = await this._dbFindOne(filter, mongoOptions);
    const outputCodec = this.getOutputCodec('find');
    if (out) return outputCodec(out);
  }

  /**
   * Finds multiple documents in the MongoDB collection.
   *
   * @param {MongoEntityService.FindManyCommand<T>} command
   */
  protected async _findMany(command: MongoEntityService.FindManyCommand<T>): Promise<PartialDTO<T>[]> {
    const { options } = command;
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['projection', 'sort', 'skip', 'limit', 'filter']),
    };
    const limit = options?.limit || 10;
    const stages: mongodb.Document[] = [];
    let filter: mongodb.Filter<any> | undefined;
    if (options?.filter) filter = MongoAdapter.prepareFilter(options?.filter);

    if (filter) stages.push({ $match: filter });
    if (options?.skip) stages.push({ $skip: options.skip });
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) stages.push({ $sort: sort });
    }
    stages.push({ $limit: limit });

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) stages.push({ $project: projection });
    const cursor = await this._dbAggregate(stages, mongoOptions);
    /** Execute db command */
    try {
      /** Fetch the cursor and decode the result objects */
      const outputCodec = this.getOutputCodec('find');
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
  protected async _findManyWithCount(command: MongoEntityService.FindManyCommand<T>): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const { options } = command;
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['projection', 'sort', 'skip', 'limit', 'filter']),
    };
    const limit = options?.limit || 10;
    let filter: mongodb.Filter<any> | undefined;
    if (options?.filter) filter = MongoAdapter.prepareFilter(options?.filter);

    const dataStages: mongodb.Document[] = [];
    const countStages: any[] = [];
    if (filter) countStages.push({ $match: filter });
    countStages.push({ $count: 'totalMatches' });
    const stages: mongodb.Document[] = [
      {
        $facet: {
          data: dataStages,
          count: countStages,
        },
      },
    ];

    if (filter) dataStages.push({ $match: filter });
    if (options?.skip) dataStages.push({ $skip: options.skip });
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) dataStages.push({ $sort: sort });
    }
    dataStages.push({ $limit: limit });

    const dataType = this.dataType;
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) dataStages.push({ $project: projection });
    const outputCodec = this.getOutputCodec('find');
    /** Execute db command */
    const cursor = await this._dbAggregate(stages, mongoOptions);
    try {
      /** Fetch the cursor and decode the result objects */
      const facetResult = await cursor.toArray();
      return {
        count: facetResult[0].count[0]?.totalMatches || 0,
        items: facetResult[0].data?.map((r: any) => outputCodec(r)),
      };
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {MongoEntityService.UpdateOneCommand<T>} command
   */
  protected async _update(command: MongoEntityService.UpdateOneCommand<T>): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { input, inputRaw, options } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    }
    let update: UpdateFilter<T>;
    if (input) {
      const inputCodec = this.getInputCodec('update');
      const doc = inputCodec(input);
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      update.$set = update.$set || ({} as any);
    } else update = inputRaw!;

    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId!, ['_id']),
      options?.filter,
    ]);

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.dataType, options?.projection),
    };
    const out = await this._dbFindOneAndUpdate(filter, update, mongoOptions);
    const outputCodec = this.getOutputCodec('update');
    if (out) return outputCodec(out);
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {MongoEntityService.UpdateOneCommand<T>} command
   */
  protected async _updateOnly(command: MongoEntityService.UpdateOneCommand<T>): Promise<number> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { input, inputRaw, options } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    }
    let update: UpdateFilter<T>;
    if (input) {
      const inputCodec = this.getInputCodec('update');
      const doc = inputCodec(input);
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length) return 0;
    } else update = inputRaw!;

    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(command.documentId, ['_id']),
      options?.filter,
    ]);

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.dataType, options?.projection),
    };
    const out = await this._dbUpdateOne(filter, update, mongoOptions);
    return out.matchedCount;
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {MongoEntityService.UpdateManyCommand<T>} command
   */
  protected async _updateMany(command: MongoEntityService.UpdateManyCommand<T>): Promise<number> {
    isNotNullish(command.input, { label: 'input' });
    const { input, inputRaw, options } = command;
    isNotNullish(input || inputRaw, { label: 'input' });
    if (input && inputRaw) {
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    }
    let update: UpdateFilter<T>;
    if (input) {
      const inputCodec = this.getInputCodec('update');
      const doc = inputCodec(input);
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length) return 0;
    } else update = inputRaw!;

    const mongoOptions: mongodb.UpdateOptions = {
      ...omit(options, 'filter'),
      upsert: undefined,
    };
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this._dbUpdateMany(filter, update, mongoOptions);
    return r.matchedCount;
  }
}
