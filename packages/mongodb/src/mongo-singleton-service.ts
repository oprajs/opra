import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { ResourceNotFoundError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { PartialInput, PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoService } from './mongo-service.js';

/**
 *
 * @class MongoSingletonService
 */
export class MongoSingletonService<T extends mongodb.Document> extends MongoService<T> {
  protected _id: any;
  collectionKey: string;

  constructor(dataType: Type | string, options?: MongoSingletonService.Options) {
    super(dataType, options);
    this.collectionKey = options?.collectionKey || '_id';
    this._id = options?._id || new ObjectId('655608925cad472b75fc6485');
  }

  /**
   * Fetches the Document. Throws error undefined if not found.
   *
   * @param options
   */
  async assert(options?: MongoSingletonService.GetOptions<T>): Promise<PartialOutput<any>> {
    const out = await this.get(options);
    if (!out)
      throw new ResourceNotFoundError(this.resourceName || this.getCollectionName());
    return out;
  }

  /**
   * Inserts the document into MongoDB
   *
   * @param doc
   * @param options
   */
  async create(
      doc: mongodb.OptionalUnlessRequiredId<T>,
      options?: MongoSingletonService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const r = await this.__insertOne({...doc, _id: this._id}, options);
    if (r.insertedId)
      return doc as any;
    /* istanbul ignore next */
    throw new Error('Unknown error while creating document');
  }

  /**
   * Delete the document from a collection
   *
   * @param options
   */
  async delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    const filter = MongoAdapter.prepareFilter([{_id: this._id}, options?.filter]);
    const r = await this.__deleteOne(filter, options);
    return r.deletedCount;
  }

  /**
   * Checks if the document exists.
   * Returns true if document exists, false otherwise
   *
   */
  async exists(): Promise<boolean> {
    return !!(await this.get({pick: ['_id']}));
  }

  /**
   * Fetches the document
   *
   * @param options
   */
  async get(options?: MongoSingletonService.GetOptions<T>): Promise<PartialOutput<T> | undefined> {
    const filter = MongoAdapter.prepareFilter([{_id: this._id}, options?.filter]);
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      projection: MongoAdapter.prepareProjection(this.getDataType(), options),
      sort: undefined,
      skip: undefined,
      limit: undefined
    }
    return await this.__findOne(filter, mongoOptions);
  }

  /**
   * Updates a single document.
   * Returns updated document
   *
   * @param doc
   * @param options
   */
  async update(
      doc: PartialInput<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    // Prevent updating _id field
    delete (doc as any)._id;
    const filter = MongoAdapter.prepareFilter([
      {_id: this._id},
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

}

/**
 *
 * @namespace MongoSingletonService
 */
export namespace MongoSingletonService {

  export interface Options extends MongoService.Options {
    collectionKey?: string;
    _id?: any;
  }

  export interface CreateOptions extends mongodb.InsertOneOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface GetOptions<T> extends StrictOmit<mongodb.FindOptions, 'sort' | 'limit' | 'skip'> {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface UpdateOptions<T> extends mongodb.FindOneAndUpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

}
