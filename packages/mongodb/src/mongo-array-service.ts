import omit from 'lodash.omit';
import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import * as OpraCommon from '@opra/common';
import { ComplexType, NotAcceptableError, PartialInput, ResourceNotFoundError } from '@opra/common';
import { PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoCollectionService } from './mongo-collection-service.js';
import { MongoService } from './mongo-service.js';
import { AnyId } from './types.js';

/**
 * A class that provides methods to perform operations on an array field in a MongoDB collection.
 * @template T The type of the array item.
 */
export class MongoArrayService<T extends mongodb.Document> extends MongoService<T> {
  /**
   * Represents the key for a collection.
   *
   * @type {string}
   */
  collectionKey: string;
  /**
   * Represents the name of the array field in parent document
   *
   * @type {string} FieldName
   */
  fieldName: string;
  /**
   * Represents the key field of an array.
   *
   * @type {string} arrayKey
   */
  arrayKey: string;
  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  constructor(dataType: Type | string, fieldName: string, options?: MongoArrayService.Options) {
    super(dataType, options);
    this.fieldName = fieldName;
    this.defaultLimit = options?.defaultLimit || 10;
    this.collectionKey = options?.collectionKey || '_id';
    this.arrayKey = options?.arrayKey || '_id';
  }

  /**
   * Retrieves the data type of the array field
   *
   * @returns {ComplexType} The complex data type of the field.
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  getDataType(): ComplexType {
    const t = super.getDataType()
        .getField(this.fieldName).type;
    if (!(t instanceof ComplexType))
      throw new NotAcceptableError(`Data type "${t.name}" is not a ComplexType`);
    return t;
  }

  /**
   * Asserts whether a resource with the specified parentId and id exists.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {AnyId} id - The ID of the resource.
   * @return {Promise<void>} - A promise that resolves with no value upon success.
   * @throws {ResourceNotFoundError} - If the resource does not exist.
   */
  async assert(documentId: AnyId, id: AnyId): Promise<void> {
    if (!(await this.exists(documentId, id)))
      throw new ResourceNotFoundError(
          (this.resourceName || this.getCollectionName()) + '.' + this.arrayKey,
          documentId + '/' + id);
  }


  /**
   * Adds a single item into the array field.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {T} input - The item to be added to the array field.
   * @param {MongoArrayService.CreateOptions} [options] - Optional options for the create operation.
   * @return {Promise<PartialOutput<T>>} - A promise that resolves with the partial output of the created item.
   * @throws {ResourceNotFoundError} - If the parent document is not found.
   */
  async create(
      documentId: AnyId,
      input: T,
      options?: MongoArrayService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const encode = this.getEncoder('create');
    const doc: any = encode(input);
    doc[this.arrayKey] = doc[this.arrayKey] || this._generateId();

    const docFilter = MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]);
    const r = await this.__updateOne(
        docFilter,
        {
          $push: {[this.fieldName]: doc} as any
        },
        options
    );
    if (r.modifiedCount) {
      if (!options)
        return doc;
      try {
        return this.get(documentId, doc[this.arrayKey], {...options, filter: undefined, skip: undefined});
      } catch (e: any) {
        Error.captureStackTrace(e);
        throw e;
      }
    }
    throw new ResourceNotFoundError(this.resourceName || this.getCollectionName(), documentId);
  }

  /**
   * Counts the number of documents in the collection that match the specified parentId and options.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {object} options - Optional parameters for counting.
   * @param {object} options.filter - The filter object to apply to the count operation.
   * @returns {Promise<number>} - A promise that resolves to the count of documents.
   */
  async count(
      documentId: AnyId,
      options?: MongoArrayService.CountOptions<T>
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]);
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
   * Deletes an element from an array within a document in the MongoDB collection.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {AnyId} id - The ID of the element to delete from the array.
   * @param {MongoArrayService.DeleteOptions<T>} [options] - Additional options for the delete operation.
   * @return {Promise<number>} - A Promise that resolves to the number of elements deleted (1 if successful, 0 if not).
   */
  async delete(
      documentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.DeleteOptions<T>
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]);
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
   * Deletes multiple items from a collection based on the parent ID and optional filter.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {MongoArrayService.DeleteManyOptions<T>} options - Optional options to specify a filter.
   * @returns {Promise<number>} - A Promise that resolves to the number of items deleted.
   */
  async deleteMany(
      documentId: AnyId,
      options?: MongoArrayService.DeleteManyOptions<T>
  ): Promise<number> {
    const docFilter = MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]);
    // Count matching items, we will use this as result
    const matchCount = await this.count(documentId, options);

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
   * Checks if an array element with the given parentId and id exists.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {AnyId} id - The id of the record.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the record exists or not.
   */
  async exists(documentId: AnyId, id: AnyId): Promise<boolean> {
    return !!(await this.findById(documentId, id, {pick: ['_id']}));
  }

  /**
   * Finds an element in array field by its parent ID and ID.
   *
   * @param {AnyId} documentId - The ID of the document.
   * @param {AnyId} id - The ID of the document.
   * @param {MongoArrayService.FindOneOptions} [options] - The optional options for the operation.
   * @returns {Promise<PartialOutput<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async findById(
      documentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.FindOneOptions
  ): Promise<PartialOutput<T> | undefined> {
    let filter = MongoAdapter.prepareKeyValues(id, [this.arrayKey]);
    if (options?.filter)
      filter = MongoAdapter.prepareFilter([filter, options?.filter]);
    return await this.findOne(documentId, {...options, filter});
  }


  /**
   * Finds the first array element that matches the given parentId.
   *
   * @param {AnyId} documentId - The ID of the document.
   * @param {MongoArrayService.FindOneOptions} [options] - Optional options to customize the query.
   * @returns {Promise<PartialOutput<T> | undefined>} A promise that resolves to the first matching document, or `undefined` if no match is found.
   */
  async findOne(
      documentId: AnyId,
      options?: MongoArrayService.FindOneOptions
  ): Promise<PartialOutput<T> | undefined> {
    const rows = await this.findMany(documentId, {
      ...options,
      limit: 1
    });
    return rows?.[0];
  }

  /**
   * Finds multiple elements in an array field.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {MongoArrayService.FindManyOptions<T>} [options] - The options for finding the documents.
   * @returns {Promise<PartialOutput<T>[] | undefined>} - The found documents.
   */
  async findMany(
      documentId: AnyId,
      options?: MongoArrayService.FindManyOptions<T>
  ): Promise<PartialOutput<T>[] | undefined> {
    const matchFilter = MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]);
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

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options);
    if (projection)
      dataStages.push({$project: projection});
    const decoder = this.getDecoder();

    const cursor: mongodb.AggregationCursor = await this.__aggregate(stages, {
      ...mongoOptions
    });
    try {
      if (options?.count) {
        const facetResult = await cursor.toArray();
        this.context.response.totalMatches = facetResult[0].count[0].totalMatches || 0;
        return facetResult[0].data.map((r: any) => decoder(r));
      } else
        return await cursor.toArray();
    } finally {
      if (!cursor.closed)
        await cursor.close();
    }
  }

  /**
   * Retrieves a specific item from the array of a document.
   *
   * @param {AnyId} documentId - The ID of the document.
   * @param {AnyId} id - The ID of the item.
   * @param {MongoArrayService.FindOneOptions<T>} [options] - The options for finding the item.
   * @returns {Promise<PartialOutput<T>>} - The item found.
   * @throws {ResourceNotFoundError} - If the item is not found.
   */
  async get(
      documentId: AnyId,
      id: AnyId,
      options?: MongoArrayService.FindOneOptions<T>
  ): Promise<PartialOutput<T>> {
    const out = await this.findById(documentId, id, options);
    if (!out)
      throw new ResourceNotFoundError(
          (this.resourceName || this.getCollectionName()) + '.' + this.arrayKey,
          documentId + '/' + id);
    return out;
  }


  /**
   * Updates an array element with new data and returns the updated element
   *
   * @param {AnyId} documentId - The ID of the document to update.
   * @param {AnyId} id - The ID of the item to update within the document.
   * @param {PartialInput<T>} input - The new data to update the item with.
   * @param {MongoArrayService.UpdateOptions<T>} [options] - Additional update options.
   * @returns {Promise<PartialOutput<T> | undefined>} The updated item or undefined if it does not exist.
   * @throws {Error} If an error occurs while updating the item.
   */
  async update(
      documentId: AnyId,
      id: AnyId,
      input: PartialInput<T>,
      options?: MongoArrayService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    await this.updateOnly(documentId, id, input, options);
    try {
      return await this.findById(documentId, id, options);
    } catch (e: any) {
      Error.captureStackTrace(e);
      throw e;
    }
  }

  /**
   * Update an array element with new data. Returns 1 if document updated 0 otherwise.
   *
   * @param {AnyId} documentId - The ID of the parent document.
   * @param {AnyId} id - The ID of the document to update.
   * @param {PartialInput<T>} doc - The partial input object containing the fields to update.
   * @param {MongoArrayService.UpdateOptions<T>} [options] - Optional update options.
   * @returns {Promise<number>} - A promise that resolves to the number of elements updated.
   */
  async updateOnly(
      documentId: AnyId,
      id: AnyId,
      doc: PartialInput<T>,
      options?: MongoArrayService.UpdateOptions<T>
  ): Promise<number> {
    let filter = MongoAdapter.prepareKeyValues(id, [this.arrayKey]);
    if (options?.filter)
      filter = MongoAdapter.prepareFilter([filter, options?.filter]);
    return await this.updateMany(documentId, doc, {...options, filter});
  }

  /**
   * Updates multiple array elements in document
   *
   * @param {AnyId} documentId - The ID of the document to update.
   * @param {PartialInput<T>} input - The updated data for the document(s).
   * @param {MongoArrayService.UpdateManyOptions<T>} [options] - Additional options for the update operation.
   * @returns {Promise<number>} - A promise that resolves to the number of documents updated.
   */
  async updateMany(
      documentId: AnyId,
      input: PartialInput<T>,
      options?: MongoArrayService.UpdateManyOptions<T>
  ): Promise<number> {
    const encode = this.getEncoder('update');
    const doc = encode(input);
    if (!Object.keys(doc).length)
      return 0;
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, [this.collectionKey]),
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
   * Updates multiple elements and returns the count of elements that were updated.
   *
   * @param {AnyId} documentId - The ID of the document to update.
   * @param {PartialInput<T>} doc - The partial document to update with.
   * @param {MongoArrayService.UpdateManyOptions<T>} [options] - The options for updating multiple documents.
   * @return {Promise<number>} A promise that resolves to the number of elements updated.
   */
  async updateManyReturnCount(
      documentId: AnyId,
      doc: PartialInput<T>,
      options?: MongoArrayService.UpdateManyOptions<T>
  ): Promise<number> {
    const r = await this.updateMany(documentId, doc, options);
    return r
        // Count matching items that fits filter criteria
        ? await this.count(documentId, options)
        : 0;
  }

  /**
   * Generates a new id for new inserting Document.
   *
   * @protected
   * @returns {AnyId} A new instance of AnyId.
   */
  protected _generateId(): AnyId {
    return new ObjectId();
  }

}

/**
 *
 * @namespace MongoArrayService
 */
export namespace MongoArrayService {

  /**
   * The constructor options of MongoArrayService.
   */
  export interface Options extends MongoCollectionService.Options {
    arrayKey?: string;
  }

  /**
   * Represents options for creating objects.
   *
   * @interface
   */
  export interface CreateOptions extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  /**
   * Represents options for counting a new object.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface CountOptions<T> extends mongodb.AggregateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for deleting single object.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions<T> extends mongodb.UpdateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for deleting multiple objects.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteManyOptions<T> extends mongodb.UpdateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for finding single object.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOneOptions<T = any> extends StrictOmit<FindManyOptions<T>, 'count' | 'limit'> {
  }

  /**
   * Represents options for finding multiple objects.
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
    count?: boolean;
    limit?: number;
    skip?: number;
  }

  /**
   * Represents options for updating single object.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOptions<T> extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  /**
   * Represents options for updating multiple objects.
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateManyOptions<T> extends mongodb.UpdateOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }
}
