import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { Collection, CollectionResource, PartialOutput } from '@opra/common';
import { EndpointContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export namespace MongoCollectionResource {
  export interface Options {
    defaultLimit?: number;
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class MongoCollectionResource<T extends mongodb.Document>
    implements CollectionResource<T> {

  defaultLimit?: number;

  constructor(options?: MongoCollectionResource.Options) {
    this.defaultLimit = options?.defaultLimit || 100;
  }

  @Collection.Create()
  async create?(ctx: Collection.Create.Context): Promise<PartialOutput<T>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.insertOne(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete?(ctx: EndpointContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany?(ctx: EndpointContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.filter, prepared.options);
  }

  @Collection.Get()
  async get?(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Collection.Update()
  async update?(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany?(ctx: EndpointContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.FindMany()
  async findMany?(ctx: EndpointContext): Promise<PartialOutput<T>[]> {
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

  abstract getService(ctx: EndpointContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
