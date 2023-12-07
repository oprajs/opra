import omit from 'lodash.omit';
import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import vg from 'valgen';
import * as OpraCommon from '@opra/common';
import { ComplexType, DataType, NotAcceptableError, PartialInput, ResourceNotFoundError } from '@opra/common';
import { PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoCollectionService } from './mongo-collection-service.js';
import { MongoService } from './mongo-service.js';
import { AnyId } from './types.js';

/**
 *
 * @class MongoArrayService
 */
export class MongoArrayService<T extends mongodb.Document> extends MongoService<T> {
  protected _encoders: Record<string, vg.Validator> = {};
  collectionKey: string;
  arrayKey: string;
  defaultLimit: number;
  fieldName: string;

  constructor(dataType: Type | string, fieldName: string, options?: MongoArrayService.Options) {
    super(dataType, options);
    this.fieldName = fieldName;
    this.defaultLimit = options?.defaultLimit || 10;
    this.collectionKey = options?.collectionKey || '_id';
    this.arrayKey = options?.arrayKey || '_id';
  }

  getArrayDataType(): ComplexType {
    const t = this.getDataType()
        .getField(this.fieldName).type;
    if (!(t instanceof ComplexType))
      throw new NotAcceptableError(`Data type "${t.name}" is not a ComplexType`);
    return t;
  }

  /**
   * Checks if array item exists. Throws error if not.
   *
   * @param parentId
   * @param id
   */
  async assert(parentId: AnyId, id: AnyId): Promise<void> {
    if (!(await this.exists(parentId, id)))
      throw new ResourceNotFoundError(
          (this.resourceName || this.getCollectionName()) + '.' + this.arrayKey,
          parentId + '/' + id);
  }


  /**
   * Adds a single item into array field.
   *
   * @param parentId
   * @param input
   * @param options
   */
  async create(
      parentId: AnyId,
      input: T,
      options?: MongoArrayService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const encode = this._getEncoder('create');
    const doc = encode(input);
    doc[this.arrayKey] = doc[this.arrayKey] || this._generateId();

    const docFilter = MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]);
    const r = await this.__updateOne(
        docFilter,
        {
          $push: {[this.fieldName]: doc} as any
        },
        options
    );
    if (r.modifiedCount)
      try {
        return this.get(parentId, doc[this.arrayKey], {...options, filter: undefined, skip: undefined});
      } catch (e: any) {
        Error.captureStackTrace(e);
        throw e;
      }
    throw new ResourceNotFoundError(this.resourceName || this.getCollectionName(), parentId);
  }

  /**
   * Gets the number of array items matching the filter.
   * @param parentId
   * @param options
   */
  async count(
      parentId: AnyId,
      options?: MongoArrayService.CountOptions<T>
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]);
    const stages: mongodb.Document[] = [
      {$match: matchFilter},
      {$unwind: {path: "$" + this.fieldName}},
      {$replaceRoot: {newRoot: "$" + this.fieldName}}
    ];
    if (options?.filter) {
      const optionsFilter = MongoAdapter.prepareFilter(options.filter);
      stages.push({$match: optionsFilter});
    }
    stages.push({$count: '*'});

    const r = await this.__aggregate(stages, options);
    try {
      const n = await r.next();
      return n?.['*'] || 0;
    } finally {
      await r.close();
    }
  }

  /**
   * Removes one item from an array field
   *
   * @param parentId
   * @param id
   * @param options
   */
  async delete(
      parentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.DeleteOptions<T>
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]);
    const pullFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.arrayKey]),
      options?.filter
    ]);
    const r = await this.__updateOne(
        matchFilter,
        {
          $pull: {[this.fieldName]: pullFilter} as any
        },
        options
    );
    return r.modifiedCount ? 1 : 0;
  }

  /**
   * Removes multiple items from an array field
   *
   * @param parentId
   * @param options
   */
  async deleteMany(
      parentId: AnyId,
      options?: MongoArrayService.DeleteManyOptions<T>
  ): Promise<number> {
    const docFilter = MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]);
    // Count matching items, we will use this as result
    const matchCount = await this.count(parentId, options);

    const pullFilter = MongoAdapter.prepareFilter(options?.filter) || {};
    const r = await this.__updateOne(
        docFilter,
        {
          $pull: {[this.fieldName]: pullFilter} as any
        },
        options
    );
    if (r.modifiedCount)
      return matchCount;
    return 0;
  }

  /**
   * Returns true if item exists, false otherwise
   *
   * @param parentId
   * @param id
   */
  async exists(parentId: AnyId, id: AnyId): Promise<boolean> {
    return !!(await this.findById(parentId, id, {pick: ['_id']}));
  }

  /**
   * Fetches the first item in an array field that matches by id.
   *
   * @param parentId
   * @param id
   * @param options
   */
  async findById(
      parentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.FindOneOptions
  ): Promise<PartialOutput<T> | undefined> {
    let filter = MongoAdapter.prepareKeyValues(id, [this.arrayKey]);
    if (options?.filter)
      filter = MongoAdapter.prepareFilter([filter, options?.filter]);
    return await this.findOne(parentId, {...options, filter});
  }


  /**
   * Fetches the first item in an array field that matches the filter. Returns undefined if not found.
   *
   * @param parentId
   * @param options
   */
  async findOne(
      parentId: AnyId,
      options?: MongoArrayService.FindOneOptions
  ): Promise<PartialOutput<T> | undefined> {
    const rows = await this.findMany(parentId, {
      ...options,
      limit: 1
    });
    return rows?.[0];
  }

  /**
   * Fetches all items in an array field that matches the filter
   *
   * @param parentId
   * @param options
   */
  async findMany(
      parentId: AnyId,
      options?: MongoArrayService.FindManyOptions<T>
  ): Promise<PartialOutput<T>[] | undefined> {
    const matchFilter = MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]);
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['pick', 'include', 'omit', 'sort', 'skip', 'limit', 'filter', 'count'])
    };
    const limit = options?.limit || this.defaultLimit;
    const stages: mongodb.Document[] = [
      {$match: matchFilter},
      {$unwind: {path: "$" + this.fieldName}},
      {$replaceRoot: {newRoot: "$" + this.fieldName}}
    ]
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

    const dataType = this.getArrayDataType();
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
   * Fetches the first item in an array field that matches the item id. Throws error undefined if not found.
   *
   * @param parentId
   * @param id
   * @param options
   */
  async get(
      parentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.FindOneOptions<T>
  ): Promise<PartialOutput<T>> {
    const out = await this.findById(parentId, id, options);
    if (!out)
      throw new ResourceNotFoundError(
          (this.resourceName || this.getCollectionName()) + '.' + this.arrayKey,
          parentId + '/' + id);
    return out;
  }


  /**
   * Update a single item in array field
   *
   * @param parentId
   * @param id
   * @param input
   * @param options
   */
  async update(
      parentId: AnyId,
      id: AnyId,
      input: PartialInput<T>,
      options?: MongoArrayService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    await this.updateOnly(parentId, id, input, options);
    try {
      return await this.findById(parentId, id, options);
    } catch (e: any) {
      Error.captureStackTrace(e);
      throw e;
    }
  }

  /**
   * Update a single item in array field
   * Returns how many master documents updated (not array items)
   *
   * @param parentId
   * @param id
   * @param doc
   * @param options
   */
  async updateOnly(
      parentId: AnyId,
      id: AnyId,
      doc: PartialInput<T>,
      options?: MongoArrayService.UpdateOptions<T>
  ): Promise<number> {
    let filter = MongoAdapter.prepareKeyValues(id, [this.arrayKey]);
    if (options?.filter)
      filter = MongoAdapter.prepareFilter([filter, options?.filter]);
    return await this.updateMany(parentId, doc, {...options, filter});
  }

  /**
   * Update multiple items in array field, returns how many master documents updated (not array items)
   *
   * @param parentId
   * @param input
   * @param options
   */
  async updateMany(
      parentId: AnyId,
      input: PartialInput<T>,
      options?: MongoArrayService.UpdateManyOptions<T>
  ): Promise<number> {
    const encode = this._getEncoder('update');
    const doc = encode(input);
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(parentId, [this.collectionKey]),
      {[this.fieldName]: {$exists: true}}
    ])
    if (options?.filter) {
      const elemMatch = MongoAdapter.prepareFilter(options?.filter, {fieldPrefix: 'elem.'});
      options = options || {};
      options.arrayFilters = [elemMatch];
    }
    const update: any = MongoAdapter.preparePatch(doc, {
      fieldPrefix: this.fieldName + (options?.filter ? '.$[elem].' : '.$[].')
    });

    const r = await this.__updateOne(
        matchFilter,
        update,
        options
    );
    return r.modifiedCount;
  }

  /**
   * Update multiple items in array field and returns number of updated array items
   *
   * @param parentId
   * @param doc
   * @param options
   */
  async updateManyReturnCount(
      parentId: AnyId,
      doc: PartialInput<T>,
      options?: MongoArrayService.UpdateManyOptions<T>
  ): Promise<number> {
    const r = await this.updateMany(parentId, doc, options);
    return r
        // Count matching items that fits filter criteria
        ? await this.count(parentId, options)
        : 0;
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
    const dataType = this.getArrayDataType();
    const options: DataType.GenerateCodecOptions = {};
    if (operation === 'update') {
      options.omit = ['_id'];
      options.partial = true;
    }
    return dataType.generateCodec('encode', options);
  }

}

/**
 *
 * @namespace MongoArrayService
 */
export namespace MongoArrayService {

  export interface Options extends MongoCollectionService.Options {
    arrayKey?: string;
  }

  export interface CreateOptions extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  export interface CountOptions<T> extends mongodb.AggregateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface DeleteOptions<T> extends mongodb.UpdateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface DeleteManyOptions<T> extends mongodb.UpdateOptions {
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
    count?: boolean;
    limit?: number;
    skip?: number;
  }

  export interface UpdateOptions<T> extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface UpdateManyOptions<T> extends mongodb.UpdateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }
}
