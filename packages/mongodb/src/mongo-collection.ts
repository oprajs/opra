import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { Collection, ICollection, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export namespace MongoCollection {
  export interface Options {
    defaultLimit?: number;
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class MongoCollection<T extends mongodb.Document> implements ICollection<T> {
  defaultLimit?: number;

  constructor(options?: MongoCollection.Options) {
    this.defaultLimit = options?.defaultLimit || 100;
  }

  async create?(ctx: Collection.Create.Context): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    return this._create(ctx, prepared);
  }

  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._delete(ctx, prepared);
  }

  async deleteMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._deleteMany(ctx, prepared);
  }

  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._get(ctx, prepared);
  }

  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._update(ctx, prepared);
  }

  async updateMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._updateMany(ctx, prepared);
  }

  async findMany?(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = await this._prepare(ctx);
    return this._findMany(ctx, prepared);
  }

  protected async _prepare(ctx: RequestContext): Promise<MongoAdapter.TransformedRequest> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  protected async _findMany(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<PartialOutput<T>[]> {
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.find(prepared.filter, prepared.options),
        service.count(prepared.filter, prepared.options)
      ]);
      ctx.response.totalMatches = count;
      return items;
    }
    return service.find(prepared.filter, prepared.options);
  }

  protected async _create(ctx: Collection.Create.Context, prepared: MongoAdapter.TransformedRequest): Promise<PartialOutput<T>> {
    const service = await this.getService(ctx);
    return service.insertOne(prepared.data, prepared.options);
  }

  protected async _delete(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  protected async _deleteMany(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.filter, prepared.options);
  }

  protected async _get(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  protected async _update(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.data, prepared.options);
  }

  protected async _updateMany(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.data, prepared.options);
  }

  protected onPrepare?(ctx: RequestContext,
                       prepared: MongoAdapter.TransformedRequest): MongoAdapter.TransformedRequest | Promise<MongoAdapter.TransformedRequest>;

  protected abstract getService(ctx: RequestContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
