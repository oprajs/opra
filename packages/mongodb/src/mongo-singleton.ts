import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { ISingleton, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoSingleton<T extends mongodb.Document> implements ISingleton<T> {

  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    return this._create(ctx, prepared);
  }

  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._delete(ctx, prepared);
  }

  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._get(ctx, prepared);
  }

  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._update(ctx, prepared);
  }

  protected async _create(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<PartialOutput<T>> {
    const service = await this.getService(ctx);
    await service.deleteMany();
    return service.insertOne(prepared.data, prepared.options);
  }

  protected async _delete(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  protected async _get(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  protected async _update(ctx: RequestContext, prepared: MongoAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.data, prepared.options);
  }

  protected async _prepare(ctx: RequestContext): Promise<MongoAdapter.TransformedRequest> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  protected onPrepare?(ctx: RequestContext,
                       prepared: MongoAdapter.TransformedRequest): MongoAdapter.TransformedRequest | Promise<MongoAdapter.TransformedRequest>;

  protected abstract getService(ctx: RequestContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
