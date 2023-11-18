import omit from 'lodash.omit';
import mongodb from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { ResourceNotFoundError } from '@opra/common';
import * as OpraCommon from '@opra/common';
import { PartialInput, PartialOutput } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoServiceBase } from './mongo-service-base.js';

export namespace MongoCollectionService {

  export interface Options extends MongoServiceBase.Options {
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

  export interface GetOptions<T = any> extends StrictOmit<mongodb.FindOptions, 'sort' | 'limit' | 'skip' | 'projection'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
    pick?: string[],
    omit?: string[],
    include?: string[],
  }

  export interface FindManyOptions<T> extends StrictOmit<mongodb.FindOptions, 'sort' | 'projection'> {
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
    pick?: string[],
    omit?: string[],
    include?: string[],
    sort?: string[];
  }

  export interface UpdateOptions<T> extends mongodb.UpdateOptions {
    pick?: string[],
    omit?: string[],
    include?: string[],
    filter?: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }

  export interface UpdateManyOptions<T> extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
    filter: mongodb.Filter<T> | OpraCommon.OpraFilter.Ast | string;
  }
}

/**
 *
 * @class MongoCollectionService
 */
export class MongoCollectionService<T extends mongodb.Document> extends MongoServiceBase<T> {
  defaultLimit: number;

  constructor(options?: MongoCollectionService.Options)
  constructor(collectionName: string, options?: MongoCollectionService.Options)
  constructor(arg0: any, arg1?: any) {
    super(arg0, arg1);
    const options = typeof arg0 === 'object' ? arg0 : arg1;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  protected get resource(): OpraCommon.Collection {
    const resource = this.context.request.resource;
    if (resource instanceof OpraCommon.Collection)
      return resource;
    throw new TypeError(`"${resource}" resource is not a Collection`);
  }

  protected async create(
      doc: mongodb.OptionalUnlessRequiredId<T>,
      options?: MongoCollectionService.CreateOptions
  ): Promise<PartialOutput<T>> {
    const r = await this._rawInsertOne(doc, options);
    if (r.insertedId) {
      const out = await this.get({_id: r.insertedId as any}, options);
      if (out)
        return out;
    }
    /* istanbul ignore next */
    throw new Error('Unknown error while creating document');
  }

  protected async count(
      options?: MongoCollectionService.CountOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter) || {};
    return this._rawCountDocuments(filter, omit(options, 'filter'));
  }

  protected async delete(
      id: any,
      options?: MongoCollectionService.DeleteOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareKeyValues(this.resource, id);
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    const r = await this._rawDeleteOne(filter, options);
    return r.deletedCount;
  }

  protected async deleteMany(
      options?: MongoCollectionService.DeleteManyOptions<T>
  ): Promise<number> {
    const filter = MongoAdapter.prepareFilter(options?.filter) || {};
    const r = await this._rawDeleteMany(filter, omit(options, 'filter'));
    return r.deletedCount;
  }

  protected async get(
      id: any,
      options?: MongoCollectionService.GetOptions
  ): Promise<PartialOutput<T>> {
    const out = await this.findOne(id, options);
    if (!out)
      throw new ResourceNotFoundError(this.resource.name, id);
    return out;
  }

  protected async findOne(
      id: any,
      options?: MongoCollectionService.GetOptions
  ): Promise<PartialOutput<T> | undefined> {
    const filter = MongoAdapter.prepareKeyValues(this.resource, id);
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    const mongoOptions: mongodb.FindOptions = {
      ...omit(options, ['sort', 'skip', 'limit', 'filter']),
      projection: MongoAdapter.prepareProjection(this.resource.type, options),
    }
    const out = await this._rawFindOne(filter, mongoOptions);
    if (out) {
      if (this.transformData)
        return this.transformData(out);
      return out;
    }
  }

  protected async findMany(
      options?: MongoCollectionService.FindManyOptions<T>
  ): Promise<PartialOutput<T>[]> {
    const filter = MongoAdapter.prepareFilter(options?.filter) || {};
    const cursor = await this._rawFind(filter, {
      ...omit(options, 'filter'),
      sort: options?.sort ? MongoAdapter.prepareSort(options.sort) : undefined,
      projection: MongoAdapter.prepareProjection(this.resource.type, options)
    });
    try {
      const out: any[] = [];
      let obj: any;
      while (out.length < this.defaultLimit && (obj = await cursor.next())) {
        const v = this.transformData ? this.transformData(obj) : obj;
        if (v)
          out.push(obj);
      }
      return out;
    } finally {
      await cursor.close();
    }
  }

  protected async update(
      id: any,
      doc: PartialInput<T>,
      options?: MongoCollectionService.UpdateOptions<T>
  ): Promise<PartialOutput<T> | undefined> {
    const filter = MongoAdapter.prepareKeyValues(this.resource, id);
    const optionsFilter = MongoAdapter.prepareFilter(options?.filter);
    if (optionsFilter)
      filter.$and = [...(Array.isArray(optionsFilter) ? optionsFilter : [optionsFilter])];
    // Prevent updating _id field
    delete (doc as any)._id;
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.UpdateOptions = {
      ...options,
      upsert: undefined
    }
    const r = await this._rawUpdateOne(filter, patch, mongoOptions);
    if (r.modifiedCount)
      return await this.get(filter, options);
    if (r.upsertedCount)
      return await this.get(r.upsertedId, options);
  }

  protected async updateMany(
      doc: OpraCommon.PartialInput<T>,
      options?: MongoCollectionService.UpdateManyOptions<T>
  ): Promise<number> {
    // Prevent updating _id field
    delete (doc as any)._id;
    const patch = MongoAdapter.preparePatch(doc);
    const mongoOptions: mongodb.UpdateOptions = {
      ...omit(options, 'filter'),
      upsert: undefined
    }
    const filter = MongoAdapter.prepareFilter(options?.filter) || {};
    const r = await this._rawUpdateMany(filter, patch, mongoOptions);
    return r.matchedCount;
  }

}



