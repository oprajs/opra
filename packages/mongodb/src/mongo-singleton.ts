import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { ISingleton, PartialOutput, Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoSingleton<T extends mongodb.Document> implements ISingleton<T> {

  @Singleton.Create()
  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    await service.deleteMany();
    return service.insertOne(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Singleton.Get()
  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Singleton.Update()
  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
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
