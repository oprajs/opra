import omit from 'lodash.omit';
import mongodb, { UpdateFilter } from 'mongodb';
import * as assert from 'node:assert';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { InternalServerError } from '@opra/common';
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

  export interface FindOneOptions<T> extends MongoService.FindOneOptions<T> {}

  export interface FindManyOptions<T> extends MongoService.FindManyOptions<T> {}

  export interface UpdateOptions<T> extends MongoService.UpdateOptions<T> {}

  export interface UpdateManyOptions<T> extends MongoService.UpdateManyOptions<T> {}
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
   * @param {PartialDTO<T>} input
   * @param {MongoEntityService.CreateOptions} options
   * @protected
   */
  protected async _create(input: PartialDTO<T>, options?: MongoEntityService.CreateOptions): Promise<PartialDTO<T>> {
    const encode = this.getEncoder('create');
    const doc: any = encode(input);
    assert.ok(doc._id, 'You must provide the "_id" field');
    const r = await this._dbInsertOne(doc, options);
    if (r.insertedId) {
      if (!options) return doc;
      const out = await this._findById(doc._id, omit(options, 'filter'));
      if (out) return out;
    }
    /* istanbul ignore next */
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoEntityService.CountOptions<T>} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of documents in the collection.
   */
  protected async _count(options?: MongoEntityService.CountOptions<T>): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return this._dbCountDocuments(filter, omit(options, 'filter'));
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to delete.
   * @param {MongoEntityService.DeleteOptions<T>} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  protected async _delete(id: MongoAdapter.AnyId, options?: MongoEntityService.DeleteOptions<T>): Promise<number> {
    assert.ok(id, 'You must provide an id');
    const filter = MongoAdapter.prepareFilter([MongoAdapter.prepareKeyValues(id, ['_id']), options?.filter]);
    const r = await this._dbDeleteOne(filter, options);
    return r.deletedCount;
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoEntityService.DeleteManyOptions<T>} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  protected async _deleteMany(options?: MongoEntityService.DeleteManyOptions<T>): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this._dbDeleteMany(filter, omit(options, 'filter'));
    return r.deletedCount;
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   * @param {string} field
   * @param {MongoEntityService.DistinctOptions<T>} options
   * @protected
   */
  protected async _distinct(field: string, options?: MongoEntityService.DistinctOptions<T>): Promise<any[]> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return await this._dbDistinct(field, filter, omit(options, 'filter'));
  }

  /**
   * Finds a document by its ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document.
   * @param {MongoEntityService.FindOneOptions<T>} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  protected async _findById(
    id: MongoAdapter.AnyId,
    options?: MongoEntityService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter([MongoAdapter.prepareKeyValues(id, ['_id']), options?.filter]);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options?.projection),
      limit: undefined,
      skip: undefined,
      sort: undefined,
    };
    const decode = this.getDecoder();
    const out = await this._dbFindOne(filter, mongoOptions);
    return out ? (decode(out) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoEntityService.FindOneOptions} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  protected async _findOne(options?: MongoEntityService.FindOneOptions<T>): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const mongoOptions: mongodb.FindOptions = {
      ...omit(options, 'filter'),
      sort: options?.sort ? MongoAdapter.prepareSort(options.sort) : undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options?.projection),
      limit: undefined,
    };
    const decode = this.getDecoder();
    const out = await this._dbFindOne(filter, mongoOptions);
    return out ? (decode(out, { coerce: true }) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds multiple documents in the MongoDB collection.
   *
   * @param {MongoEntityService.FindManyOptions<T>} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  protected async _findMany(options?: MongoEntityService.FindManyOptions<T>): Promise<PartialDTO<T>[]> {
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

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) stages.push({ $project: projection });
    const decode = this.getDecoder();
    const cursor = await this._dbAggregate(stages, mongoOptions);
    /** Execute db command */
    try {
      /** Fetch the cursor and decode the result objects */
      return (await cursor.toArray()).map((r: any) => decode(r));
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {MongoEntityService.FindManyOptions<T>} [options] - The options for the find operation.
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  protected async _findManyWithCount(options?: MongoEntityService.FindManyOptions<T>): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
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

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) dataStages.push({ $project: projection });
    const decode = this.getDecoder();
    /** Execute db command */
    const cursor = await this._dbAggregate(stages, mongoOptions);
    try {
      /** Fetch the cursor and decode the result objects */
      const facetResult = await cursor.toArray();
      return {
        count: facetResult[0].count[0]?.totalMatches || 0,
        items: facetResult[0].data?.map((r: any) => decode(r)),
      };
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {AnyId} id - The id of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input object containing the fields to update.
   * @param {MongoEntityService.UpdateOptions<T>} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  protected async _update(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | mongodb.UpdateFilter<T>,
    options?: MongoEntityService.UpdateOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) && !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, { coerce: true });
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      update.$set = update.$set || ({} as any);
    } else update = input as UpdateFilter<T>;

    const filter = MongoAdapter.prepareFilter([MongoAdapter.prepareKeyValues(id, ['_id']), options?.filter]);

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options?.projection),
    };
    const decode = this.getDecoder();
    const out = await this._dbFindOneAndUpdate(filter, update, mongoOptions);
    return out ? (decode(out, { coerce: true }) as PartialDTO<T>) : undefined;
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {MongoAdapter.AnyId} id - The ID of the document to update.
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input data to update the document with.
   * @param {MongoEntityService.UpdateOptions<T>} [options] - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  protected async _updateOnly(
    id: MongoAdapter.AnyId,
    input: PatchDTO<T> | mongodb.UpdateFilter<T>,
    options?: MongoEntityService.UpdateOptions<T>,
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) && !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, { coerce: true });
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length) return 0;
    } else update = input as UpdateFilter<T>;

    const filter = MongoAdapter.prepareFilter([MongoAdapter.prepareKeyValues(id, ['_id']), options?.filter]);

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options?.projection),
    };
    const out = await this._dbUpdateOne(filter, update, mongoOptions);
    return out.matchedCount;
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>|UpdateFilter<T>} input - The partial input to update the documents with.
   * @param {MongoEntityService.UpdateManyOptions<T>} [options] - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  protected async _updateMany(
    input: PatchDTO<T> | mongodb.UpdateFilter<T>,
    options?: MongoEntityService.UpdateManyOptions<T>,
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) || !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) && !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, { coerce: true });
      delete doc._id;
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length) return 0;
    } else update = input as UpdateFilter<T>;

    const mongoOptions: mongodb.UpdateOptions = {
      ...omit(options, 'filter'),
      upsert: undefined,
    };
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this._dbUpdateMany(filter, update, mongoOptions);
    return r.matchedCount;
  }
}
