import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoSingletonResource<T extends mongodb.Document, TOutput = PartialOutput<T>> {
  defaultLimit = 100;

  @Singleton.Create()
  async create(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.deleteMany();
    return service.insertOne(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete(ctx: RequestContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Singleton.Get()
  async get(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Singleton.Update()
  async update(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.update, prepared.options);
  }

  abstract getService(ctx: RequestContext): MongoEntityService<T, TOutput> | Promise<MongoEntityService<T, TOutput>>;

}
