import mongodb from 'mongodb';
import { PartialOutput, ResourceNotFoundError, Singleton } from '@opra/common';
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
  async get(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    const out = await service.findOne(prepared.filter, prepared.options);
    if (!out)
      throw new ResourceNotFoundError(service.collectionName);
    return out;
  }

  @Singleton.Update()
  async update(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    const out = await service.updateOne(prepared.filter, prepared.update, prepared.options);
    if (!out)
      throw new ResourceNotFoundError(service.collectionName, prepared.filter._id);
    return out;
  }

  abstract getService(ctx: RequestContext): MongoEntityService<T, TOutput> | Promise<MongoEntityService<T, TOutput>>;

}
