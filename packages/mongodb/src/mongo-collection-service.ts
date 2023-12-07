import omit from 'lodash.omit';
import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import vg from 'valgen';
import { DataType, ResourceNotFoundError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { PartialInput, PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoService } from './mongo-service.js';
import { AnyId } from './types.js';

/**
 *
 * @class MongoCollectionService
 */
export class MongoCollectionService<T extends mongodb.Document> extends MongoService<T> {
  protected _encoders: Record<string, vg.Validator> = {};
  collectionKey: string;
  defaultLimit: number;

  constructor(dataType: Type | string, options?: MongoCollectionService.Options) {
    super(dataType, options);
    this.defaultLimit = options?.defaultLimit || 10;
    this.collectionKey = options?.collectionKey || '_id';
  }

  /**
   * Checks if document exists. Throws error if not.
   *
   * @param id
   */
  async assert(id: AnyId): Promise<void> {
    if (!(await this.exists(id)))
      throw new ResourceNotFoundError(this.resourceName || this.getCollectionName(), id);
  }

  /**
   * Inserts a single document into MongoDB
   *
   * @param input
   * @param options
   */
  async create(
      input: PartialInput<T>,
      options?: MongoCollectionService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const encode = this._getEncoder('create');
    const doc = encode(input);
    doc._id = doc._id || this._generateId();
    const r = await this.__insertOne(doc, options);
    if (r.insertedId)
      return doc as any;
    /* istanbul ignore next */
    throw new Error('Unknown error while creating document');
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param options
   */
  async count(
      options?: MongoCollectionService.CountOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return this.__countDocuments(filter, omit(options, 'filter'));
  }

  /**
   * Delete a document from a collection
   *
   * @param id
   * @param options
   */
  async delete(
      id: AnyId,
      options?: MongoCollectionService.DeleteOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ]);
    const r = await this.__deleteOne(filter, options);
    return r.deletedCount;
  }

  /**
   * Delete multiple documents from a collection
   *
   * @param options
   */
  async deleteMany(
      options?: MongoCollectionService.DeleteManyOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this.__deleteMany(filter, omit(options, 'filter'));
    return r.deletedCount;
  }

  /**
   * Checks if document exists.
   * Returns true if document exists, false otherwise
   *
   * @param id
   */
  async exists(id: AnyId): Promise<boolean> {
    return !!(await this.findById(id, {pick: ['_id']}));
  }

  /**
   * Fetches the first document matches by id.
   *
   * @param id
   * @param options
   */
  async findById(
      id: AnyId,
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialOutput<T | undefined>> {
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ]);
    return await this.findOne({...options, filter});
  }

  /**
   * Fetches the first document that matches the filter.
   * Returns undefined if not found.
   *
   * @param options
   */
  async findOne(
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialOutput<T> | undefined> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      sort: options?.sort ? MongoAdapter.prepareSort(options.sort) : undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
      limit: undefined
    }
    const out = await this.__findOne(filter, mongoOptions);
    return (out as any) || undefined;
  }

  /**
   * Fetches all document that matches the filter
   *
   * @param options
   */
  async findMany(
      options?: MongoCollectionService.FindManyOptions<T>
  ): Promise<PartialOutput<T>[]> {
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['pick', 'include', 'omit', 'sort', 'skip', 'limit', 'filter', 'count'])
    };
    const limit = options?.limit || this.defaultLimit;
    const stages: mongodb.Document[] = [];

    let dataStages = stages;
    if (options?.count) {
      dataStages = [];
      stages.push({
        $facet: {
          data: dataStages,
          count: [{$count: 'totalMatches'}]
        }
      })
    }

    if (options?.filter) {
      const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
      dataStages.push({$match: optionsFilter});
    }
    if (options?.skip)
      dataStages.push({$skip: options.skip})
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort)
        dataStages.push({$sort: sort});
    }
    dataStages.push({$limit: limit});

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options);
    if (projection)
      dataStages.push({$project: projection});

    const cursor: mongodb.AggregationCursor = await this.__aggregate(stages, {
      ...mongoOptions
    });
    try {
      if (options?.count) {
        const facetResult = await cursor.toArray();
        this.context.response.totalMatches = facetResult[0].count[0].totalMatches || 0;
        return facetResult[0].data;
      } else
        return await cursor.toArray();
    } finally {
      if (!cursor.closed)
        await cursor.close();
    }
  }

  /**
   * Fetches the first Document that matches the id. Throws error undefined if not found.
   *
   * @param id
   * @param options
   */
  async get(id: AnyId, options?: MongoCollectionService.FindOneOptions): Promise<PartialOutput<T>> {
    const out = await this.findById(id, options);
    if (!out)
      throw new ResourceNotFoundError(this.resourceName || this.getCollectionName(), id);
    return out;
  }

  /**
   * Updates a single document.
   * Returns updated document
   *
   * @param id
   * @param input
   * @param options
   */
  async update(
      id: any,
      input: PartialInput<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    const encode = this._getEncoder('update');
    const doc = encode(input);
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ])
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const out = await this.__findOneAndUpdate(filter, patch, mongoOptions);
    return (out as any) || undefined;
  }

  /**
   * Updates a single document
   * Returns number of updated documents
   *
   * @param id
   * @param input
   * @param options
   */
  async updateOnly(
      id: any,
      input: PartialInput<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ])
    const encode = this._getEncoder('update');
    const doc = encode(input);
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const out = await this.__updateOne(filter, patch, mongoOptions);
    return out.modifiedCount;
  }

  /**
   *  Update multiple documents in a collection
   *
   * @param input
   * @param options
   */
  async updateMany(
      input: OpraCommon.PartialInput<T>,
      options?: MongoCollectionService.UpdateManyOptions<T>
  ): Promise<number> {
    const encode = this._getEncoder('update');
    const doc = encode(input);
    const patch = MongoAdapter.preparePatch(doc);
    patch.$set = patch.$set || {};
    const mongoOptions: mongodb.UpdateOptions = {
      ...omit(options, 'filter'),
      upsert: undefined
    }
    const filter = MongoAdapter.prepareFilter(options?.filter) || {};
    const r = await this.__updateMany(filter, patch, mongoOptions);
    return r.matchedCount;
  }

  /**
   * Generates Id value
   *
   * @protected
   */
  protected _generateId(): AnyId {
    return new ObjectId();
  }

  /**
   * Generates a new Validator  for encoding or returns from cache if already generated before
   * @param operation
   * @protected
   */
  protected _getEncoder(operation: 'create' | 'update'): vg.Validator {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    encoder = this._generateEncoder(operation);
    this._encoders[operation] = encoder;
    return encoder;
  }

  /**
   * Generates a new Valgen Validator for encode operation
   *
   * @param operation
   * @protected
   */
  protected _generateEncoder(operation: 'create' | 'update'): vg.Validator {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    const dataType = this.getDataType();
    const options: DataType.GenerateCodecOptions = {};
    if (operation === 'update') {
      options.omit = ['_id'];
      options.partial = true;
    }
    encoder = dataType.generateCodec('encode', options);
    this._encoders[operation] = encoder;
    return encoder;
  }

}

/**
 *
 * @namespace MongoCollectionService
 */
export namespace MongoCollectionService {

  export interface Options extends MongoService.Options {
    collectionKey?: string;
    defaultLimit?: number;
  }

  export interface CreateOptions extends mongodb.InsertOneOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  export interface CountOptions<T> extends mongodb.CountOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface DeleteManyOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface FindOneOptions<T = any> extends StrictOmit<FindManyOptions<T>, 'count' | 'limit'> {
  }

  export interface FindManyOptions<T> extends mongodb.AggregateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
    pick?: string[],
    omit?: string[],
    include?: string[],
    sort?: string[];
    limit?: number;
    skip?: number;
    count?: boolean;
  }

  export interface UpdateOptions<T> extends StrictOmit<mongodb.FindOneAndUpdateOptions,
      'projection' | 'returnDocument' | 'includeResultMetadata'> {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface UpdateManyOptions<T> extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }
}
