import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { Collection, CollectionResource, PartialOutput } from '@opra/common';
import { OperationContext } from '@opra/core';
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
  async delete?(ctx: OperationContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany?(ctx: OperationContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.filter, prepared.options);
  }

  @Collection.Get()
  async get?(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Collection.Update()
  async update?(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany?(ctx: OperationContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.update, prepared.options);
  }

  @Collection.FindMany()
  async findMany?(ctx: OperationContext): Promise<PartialOutput<T>[]> {
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

  abstract getService(ctx: OperationContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
