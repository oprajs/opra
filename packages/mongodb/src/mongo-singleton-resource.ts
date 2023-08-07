import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { OperationContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export abstract class MongoSingletonResource<T extends mongodb.Document> {
  defaultLimit = 100;

  @Singleton.Create()
  async create?(ctx: OperationContext): Promise<PartialOutput<T>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.deleteMany();
    return service.insertOne(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete?(ctx: OperationContext): Promise<number> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Singleton.Get()
  async get?(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Singleton.Update()
  async update?(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.update, prepared.options);
  }

  abstract getService(ctx: OperationContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
