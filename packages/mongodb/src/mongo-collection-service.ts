import omit from 'lodash.omit';
import mongodb, { ObjectId, UpdateFilter } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { InternalServerError, PartialDTO, PatchDTO, ResourceNotAvailableError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { FilterInput } from './adapter-utils/prepare-filter.js';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoService } from './mongo-service.js';
import { AnyId } from './types.js';

/**
 * @class MongoCollectionService
 * @template T - The type of the documents in the collection.
 */
export class MongoCollectionService<T extends mongodb.Document> extends MongoService<T> {

  /**
   * Represents the key for a collection.
   *
   * @type {string}
   */
  collectionKey: string;

  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  /**
   * Represents a common filter function for a MongoCollectionService.
   *
   * @type {FilterInput | Function}
   */
  $documentFilter?: FilterInput | (
      (args: {
         crud: MongoService.CrudOp;
         method: string;
         byId: boolean;
         documentId?: AnyId;
         input?: Record<string, any>;
         options?: Record<string, any>
       },
       _this: this
      ) => FilterInput | Promise<FilterInput> | undefined);

  /**
   * Interceptor function for handling callback execution with provided arguments.
   *
   * @param callback - The callback function to be intercepted.
   * @param args - The arguments object containing the following properties:
   *   @param crud - The CRUD operation type.
   *   @param method - The method name.
   *   @param byId - True if current operation affects byId records (updateMany, deleteMany etc)
   *   @param documentId - The document ID (optional).
   *   @param input - The input object (optional).
   *   @param options - Additional options (optional).
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  $interceptor?: (
      callback: () => any,
      args: {
        crud: MongoService.CrudOp;
        method: string;
        byId: boolean;
        documentId?: AnyId;
        input?: Record<string, any>;
        options?: Record<string, any>
      }, _this: any
  ) => Promise<any>;


  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {MongoCollectionService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoCollectionService.Options) {
    super(dataType, options);
    this.collectionKey = this.collectionKey || options?.collectionKey || '_id';
    this.defaultLimit = this.defaultLimit || options?.defaultLimit || 10;
    this.$documentFilter = this.$documentFilter || options?.documentFilter;
    this.$interceptor = this.$interceptor || options?.interceptor;
  }

  /**
   * Asserts the existence of a resource with the given ID.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {AnyId} id - The ID of the resource to assert.
   * @param {MongoCollectionService.ExistsOptions} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: AnyId, options?: MongoCollectionService.ExistsOptions): Promise<void> {
    if (!(await this.exists(id, options)))
      throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Creates a new document in the MongoDB collection.
   *
   * @param {DTO<T>} input - The input data for creating the document.
   * @param {MongoCollectionService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created document.
   * @throws {Error} if an unknown error occurs while creating the document.
   */
  async create(
      input: PartialDTO<T>,
      options?: MongoCollectionService.CreateOptions
  ): Promise<PartialDTO<T>> {
    const info: any = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId: (input as any)._id,
      input,
      options
    };
    return this._intercept(
        () => this._create(input, options),
        info
    );
  }

  protected async _create(
      input: PartialDTO<T>,
      options?: MongoCollectionService.CreateOptions
  ): Promise<PartialDTO<T>> {
    const encode = this.getEncoder('create');
    const doc: any = encode(input, {coerce: true});
    doc._id = doc._id || this._generateId();
    const r = await this.__insertOne(doc, options);
    if (r.insertedId) {
      if (!options)
        return doc;
      const out = await this._findById(doc._id, {
        ...options,
        filter: undefined,
        skip: undefined
      });
      if (out)
        return out;
    }
    /* istanbul ignore next */
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {MongoCollectionService.CountOptions<T>} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of documents in the collection.
   */
  async count(
      options?: MongoCollectionService.CountOptions<T>
  ): Promise<number> {
    const info: any = {
      crud: 'read',
      method: 'count',
      byId: false,
      options
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter
          ]);
          return this._count({...options, filter})
        }, info);
  }

  protected async _count(
      options?: MongoCollectionService.CountOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return this.__countDocuments(filter, omit(options, 'filter'));
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {AnyId} id - The ID of the document to delete.
   * @param {MongoCollectionService.DeleteOptions<T>} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(
      id: AnyId,
      options?: MongoCollectionService.DeleteOptions<T>
  ): Promise<number> {
    const info: any = {
      crud: 'delete',
      method: 'delete',
      byId: false,
      documentId: id,
      options
    }
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter
          ]);
          return this._delete(id, {...options, filter})
        },
        info
    );
  }

  protected async _delete(
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
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {MongoCollectionService.DeleteManyOptions<T>} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(
      options?: MongoCollectionService.DeleteManyOptions<T>
  ): Promise<number> {
    const info: any = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter,
          ]);
          return this._deleteMany({...options, filter});
        }, info);
  }

  protected async _deleteMany(
      options?: MongoCollectionService.DeleteManyOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this.__deleteMany(filter, omit(options, 'filter'));
    return r.deletedCount;
  }

  async distinct(
      field: string,
      options?: MongoCollectionService.DistinctOptions<T>
  ): Promise<any[]> {
    const info: any = {
      crud: 'read',
      method: 'distinct',
      byId: true,
      options
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter,
          ]);
          return this._distinct(field, {...options, filter});
        }, info);
  }

  protected async _distinct(
      field: string,
      options?: MongoCollectionService.DistinctOptions<T>
  ): Promise<any[]> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    return await this.__distinct(field, filter, omit(options, 'filter'));
  }

  /**
   * Checks if an object with the given id exists.
   *
   * @param {AnyId} id - The id of the object to check.
   * @param {MongoCollectionService.ExistsOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async exists(
      id: AnyId,
      options?: MongoCollectionService.ExistsOptions
  ): Promise<boolean> {
    return !!(await this.findById(id, {...options, pick: ['_id'], omit: undefined, include: undefined}));
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {MongoCollectionService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(
      options?: MongoCollectionService.ExistsOneOptions<T>
  ): Promise<boolean> {
    return !!(await this.findOne({...options, pick: ['_id'], omit: undefined, include: undefined}));
  }

  /**
   * Finds a document by its ID.
   *
   * @param {AnyId} id - The ID of the document.
   * @param {MongoCollectionService.FindOneOptions} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
      id: AnyId,
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialDTO<T> | undefined> {
    const info: any = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options
    };
    return this._intercept(
        async () => {
          const documentFilter = await this._getDocumentFilter(info);
          const filter = MongoAdapter.prepareFilter([
            documentFilter,
            options?.filter,
          ]);
          return this._findById(id, {...options, filter});
        }, info
    );
  }

  protected async _findById(
      id: AnyId,
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ]);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      limit: undefined,
      skip: undefined,
      sort: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const decode = this.getDecoder();
    const out = await this.__findOne(filter, mongoOptions);
    return out ? decode(out, {coerce: true}) as PartialDTO<T> : undefined;
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {MongoCollectionService.FindOneOptions} options - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialDTO<T> | undefined> {
    const info: any = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options
    }
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter,
          ]);
          return this._findOne({...options, filter})
        }, info
    );
  }

  protected async _findOne(
      options?: MongoCollectionService.FindOneOptions
  ): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      sort: options?.sort ? MongoAdapter.prepareSort(options.sort) : undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
      limit: undefined
    }
    const decode = this.getDecoder();
    const out = await this.__findOne(filter, mongoOptions);
    return out ? decode(out, {coerce: true}) as PartialDTO<T> : undefined;
  }

  /**
   * Finds multiple documents in the MongoDB collection.
   *
   * @param options - The options for the find operation.
   *  - pick: string[] - An array of fields to include in the returned documents.
   *  - include: string[] - An array of fields to include in the returned documents.
   *  - omit: string[] - An array of fields to exclude from the returned documents.
   *  - sort: Record<string, number> - The sorting criteria.
   *  - skip: number - The number of documents to skip.
   *  - limit: number - The maximum number of documents to return.
   *  - filter: FilterQuery<T> - The filter conditions to apply to the find operation.
   *  - count: boolean - If set to true, returns the total count of matching documents.
   *
   * @return A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(
      options?: MongoCollectionService.FindManyOptions<T>
  ): Promise<PartialDTO<T>[]> {
    const info: any = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter,
          ]);
          return this._findMany({...options, filter});
        }, info);
  }

  protected async _findMany(
      options?: MongoCollectionService.FindManyOptions<T>
  ): Promise<PartialDTO<T>[]> {
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['pick', 'include', 'omit', 'sort', 'skip', 'limit', 'filter', 'count'])
    };
    const limit = options?.limit || this.defaultLimit;
    const stages: mongodb.Document[] = [];
    let filter: mongodb.Filter<any> | undefined;
    if (options?.filter)
      filter = MongoAdapter.prepareFilter(options?.filter);

    let dataStages = stages;
    if (options?.count) {
      dataStages = [];
      const count: any[] = [];
      if (filter)
        count.push({$match: filter});
      count.push({$count: 'totalMatches'});
      stages.push({
        $facet: {
          data: dataStages,
          count,
        }
      })
    }

    if (filter)
      dataStages.push({$match: filter});
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
    const decode = this.getDecoder();

    const cursor: mongodb.AggregationCursor = await this.__aggregate(stages, {
      ...mongoOptions
    });
    try {
      if (options?.count) {
        const facetResult = await cursor.toArray();
        this.context.response.totalMatches = facetResult[0].count[0].totalMatches || 0;
        return facetResult[0].data.map((r: any) => decode(r, {coerce: true}));
      } else
        return await cursor.toArray();
    } finally {
      if (!cursor.closed)
        await cursor.close();
    }
  }

  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {*} id - The ID of the document to retrieve.
   * @param {MongoCollectionService.FindOneOptions} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: AnyId, options?: MongoCollectionService.FindOneOptions): Promise<PartialDTO<T>> {
    const out = await this.findById(id, options);
    if (!out)
      throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a document with the given id in the collection.
   *
   * @param {any} id - The id of the document to update.
   * @param {PatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {MongoCollectionService.UpdateOptions<T>} [options] - The options for the update operation.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the updated document or
   * undefined if the document was not found.
   */
  async update(
      id: AnyId,
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    const info: any = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter
          ])
          return this._update(id, input, {...options, filter})
        }, info
    );
  }

  protected async _update(
      id: AnyId,
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<PartialDTO<T> | undefined> {
    const isUpdateFilter = Array.isArray(input) ||
        !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) &&
        !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, {coerce: true});
      update = MongoAdapter.preparePatch(doc);
      update.$set = update.$set || {} as any;
    } else update = input as UpdateFilter<T>;

    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ])

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const decode = this.getDecoder();
    const out = await this.__findOneAndUpdate(filter, update, mongoOptions);
    return out ? decode(out, {coerce: true}) as PartialDTO<T> : undefined;
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {any} id - The ID of the document to update.
   * @param {PatchDTO<T>} input - The partial input data to update the document with.
   * @param {MongoCollectionService.UpdateOptions<T>} options - The options for updating the document.
   * @returns {Promise<number>} - A promise that resolves to the number of documents modified.
   */
  async updateOnly(
      id: AnyId,
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<number> {
    const info: any = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    }
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter
          ])
          return this._updateOnly(id, input, {...options, filter})
        }, info);
  }

  protected async _updateOnly(
      id: AnyId,
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) ||
        !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) &&
        !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, {coerce: true});
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length)
        return 0;
    } else update = input as UpdateFilter<T>;

    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(id, [this.collectionKey]),
      options?.filter
    ])

    const mongoOptions: mongodb.FindOneAndUpdateOptions = {
      ...options,
      includeResultMetadata: false,
      upsert: undefined,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
    }
    const out = await this.__updateOne(filter, update, mongoOptions);
    return out.matchedCount;
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>} input - The partial input to update the documents with.
   * @param {MongoCollectionService.UpdateManyOptions<T>} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateManyOptions<T>
  ): Promise<number> {
    const info: any = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input,
      options,
    };
    return this._intercept(
        async () => {
          const filter = MongoAdapter.prepareFilter([
            await this._getDocumentFilter(info),
            options?.filter
          ]);
          return this._updateMany(input, {...options, filter})
        }, info);
  }

  protected async _updateMany(
      input: PatchDTO<T> | mongodb.UpdateFilter<T>,
      options?: MongoCollectionService.UpdateManyOptions<T>
  ): Promise<number> {
    const isUpdateFilter = Array.isArray(input) ||
        !!Object.keys(input).find(x => x.startsWith('$'));
    const isDocument = !Array.isArray(input) &&
        !!Object.keys(input).find(x => !x.startsWith('$'));
    if (isUpdateFilter && isDocument)
      throw new TypeError('You must pass one of MongoDB UpdateFilter or a partial document, not both');
    let update: UpdateFilter<T>;
    if (isDocument) {
      const encode = this.getEncoder('update');
      const doc = encode(input, {coerce: true});
      update = MongoAdapter.preparePatch(doc);
      if (!Object.keys(doc).length)
        return 0;
    } else update = input as UpdateFilter<T>;

    const mongoOptions: mongodb.UpdateOptions = {
      ...omit(options, 'filter'),
      upsert: undefined
    }
    const filter = MongoAdapter.prepareFilter(options?.filter);
    const r = await this.__updateMany(filter, update, mongoOptions);
    return r.matchedCount;
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns {AnyId} The generated ID.
   */
  protected _generateId(): AnyId {
    return typeof this.$idGenerator === 'function' ?
        this.$idGenerator(this) : new ObjectId();
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getDocumentFilter(
      args: {
        crud: MongoService.CrudOp;
        method: string;
        byId: boolean,
        documentId?: AnyId;
        input?: Object;
        options?: Record<string, any>
      }
  ): FilterInput | Promise<FilterInput> | undefined {
    return typeof this.$documentFilter === 'function' ?
        this.$documentFilter(args, this) : this.$documentFilter;
  }

  protected async _intercept(
      callback: (...args: any[]) => any,
      args: {
        crud: MongoService.CrudOp;
        method: string;
        byId: boolean,
        documentId?: AnyId;
        input?: Object;
        options?: Record<string, any>
      }
  ): Promise<any> {
    if (this.$interceptor)
      return this.$interceptor(callback, args, this);
    return callback();
  }

}

/**
 *
 * @namespace MongoCollectionService
 */
export namespace MongoCollectionService {


  /**
   * The constructor options of MongoCollectionService.
   *
   * @interface Options
   * @extends MongoService.Options
   */
  export interface Options extends MongoService.Options {
    collectionKey?: MongoCollectionService<any>['collectionKey'];
    defaultLimit?: MongoCollectionService<any>['defaultLimit'];
    documentFilter?: MongoCollectionService<any>['$documentFilter'];
    interceptor?: MongoCollectionService<any>['$interceptor'];
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends mongodb.InsertOneOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  /**
   * Represents options for "count" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface CountOptions<T> extends mongodb.CountOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "delete" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteManyOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "distinct" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DistinctOptions<T> extends mongodb.DistinctOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOneOptions<T = any> extends StrictOmit<FindManyOptions<T>, 'count' | 'limit'> {
  }

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
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

  /**
   * Represents options for "update" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOptions<T> extends StrictOmit<mongodb.FindOneAndUpdateOptions,
      'projection' | 'returnDocument' | 'includeResultMetadata'> {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateManyOptions<T> extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
  }

  /**
   * Represents options for checking the document exists
   *
   * @interface
   */
  export interface ExistsOneOptions<T> extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface OperationInfo {
    crud: MongoService.CrudOp;
    method: string;
    documentId?: AnyId;
    input?: Record<string, any>;
    options?: Record<string, any>
  }

}
