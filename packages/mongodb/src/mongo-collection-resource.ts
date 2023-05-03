import mongodb from 'mongodb';
import { Collection, PartialOutput, ResourceNotFoundError } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoCollectionResource<T extends mongodb.Document, TOutput = PartialOutput<T>> {
  defaultLimit = 100;

  @Collection.Create()
  async create(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.insertOne(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete(ctx: RequestContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany(ctx: RequestContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.filter, prepared.options);
  }

  @Collection.Get()
  async get(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    const out = await service.findOne(prepared.filter, prepared.options);
    if (!out)
      throw new ResourceNotFoundError(service.collectionName, prepared.filter._id);
    return out;
  }

  @Collection.Update()
  async update(ctx: RequestContext): Promise<TOutput> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    const out = await service.updateOne(prepared.filter, prepared.update, prepared.options);
    if (!out)
      throw new ResourceNotFoundError(service.collectionName, prepared.filter._id);
    return out;
  }

  @Collection.UpdateMany()
  async updateMany(ctx: RequestContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.FindMany()
  async search(ctx: RequestContext): Promise<TOutput[]> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    if (prepared.count) {
      const [items, count] = await Promise.all([
        service.find(prepared.filter, prepared.options),
        service.count(prepared.filter, prepared.options)
      ]);
      ctx.response.count = count;
      return items;
    }
    return service.find(prepared.filter, prepared.options);
  }

  abstract getService(ctx: RequestContext): MongoEntityService<T, TOutput> | Promise<MongoEntityService<T, TOutput>>;

}
