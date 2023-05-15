import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import { CollectionResourceBase, RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export namespace MongoCollectionResource {
  export interface Options extends CollectionResourceBase.Options {
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class MongoCollectionResource<
    T extends mongodb.Document, TOutput = PartialOutput<T>
> extends CollectionResourceBase {

  constructor(options?: MongoCollectionResource.Options) {
    super(options);
  }

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
  async get(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Collection.Update()
  async update(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany(ctx: RequestContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.FindMany()
  async findMany(ctx: RequestContext): Promise<TOutput[]> {
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
