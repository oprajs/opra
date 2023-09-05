import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { EndpointContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoSingleton<T extends mongodb.Document> {
  defaultLimit = 100;

  @Singleton.Create()
  async create?(ctx: EndpointContext): Promise<PartialOutput<T>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.deleteMany();
    return service.insertOne(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete?(ctx: EndpointContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Singleton.Get()
  async get?(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Singleton.Update()
  async update?(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.data, prepared.options);
  }

  abstract getService(ctx: EndpointContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
