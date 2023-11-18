import mongodb, { ObjectId } from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { ResourceNotFoundError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { PartialInput, PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoServiceBase } from './mongo-service-base.js';

export namespace MongoSingletonService {

  export interface Options extends MongoServiceBase.Options {
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

  export interface UpdateOptions<T> extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

}

/**
 *
 * @class MongoSingletonService
 */
export class MongoSingletonService<T extends mongodb.Document> extends MongoServiceBase<T> {
  protected _id: any;

  constructor(options?: MongoSingletonService.Options)
  constructor(collectionName: string, options?: MongoSingletonService.Options)
  constructor(arg0: any, arg1?: any) {
    super(arg0, arg1);
    const options = typeof arg0 === 'object' ? arg0 : arg1;
    this._id = options?._id || new ObjectId('655608925cad472b75fc6485');
  }

  protected get resource(): OpraCommon.Singleton {
    const resource = this.context.request.resource;
    if (resource instanceof OpraCommon.Singleton)
      return resource;
    throw new TypeError(`"${resource}" resource is not a Singleton`);
  }

  protected async create(
      doc: mongodb.OptionalUnlessRequiredId<T>,
      options?: MongoSingletonService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const r = await this._rawInsertOne({...doc, _id: this._id}, options);
    if (r.insertedId) {
      const out = await this.get(options);
      if (out)
        return out;
    }
    /* istanbul ignore next */
    throw new Error('Unknown error while creating document');
  }

  protected async delete(options?: MongoSingletonService.DeleteOptions<T>): Promise<number> {
    const filter: mongodb.Filter<T> = {_id: this._id};
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    const r = await this._rawDeleteOne(filter, options);
    return r.deletedCount;
  }

  protected async get(options?: MongoSingletonService.GetOptions<T>): Promise<PartialOutput<T>> {
    const out = await this.find(options);
    if (!out)
      throw new ResourceNotFoundError(this.resource.name);
    return out;
  }

  protected async find(options?: MongoSingletonService.GetOptions<T>): Promise<PartialOutput<T> | undefined> {
    const filter: mongodb.Filter<T> = {_id: this._id};
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    const mongoOptions: mongodb.FindOptions = {
      ...options,
      projection: MongoAdapter.prepareProjection(this.resource.type, options),
      sort: undefined,
      skip: undefined,
      limit: undefined
    }
    const out = await this._rawFindOne(filter, mongoOptions);
    if (out) {
      if (this.transformData)
        return this.transformData(out);
      return out;
    }
  }

  protected async update(
      doc: PartialInput<T>,
      options?: MongoSingletonService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    // Prevent upsert with different _id field
    if (options?.upsert)
      (doc as any)._id = this._id;
    else delete (doc as any)._id;
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.UpdateOptions = {
      ...options,
      upsert: undefined
    }
    const filter: mongodb.Filter<T> = {_id: this._id};
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    const r = await this._rawUpdateOne(filter, patch, mongoOptions);
    if (r.matchedCount)
      return await this.get(options);
  }

}



