import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import { OperationContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export namespace SqbCollectionResource {
  export interface Options {
    defaultLimit?: number;
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class SqbCollectionResource<T, TOutput = PartialOutput<T>> {
  defaultLimit?: number;

  constructor(options?: SqbCollectionResource.Options) {
    this.defaultLimit = options?.defaultLimit || 100;
  }

  @Collection.Create()
  async create(ctx: OperationContext): Promise<TOutput> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).create(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete(ctx: OperationContext): Promise<boolean> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).delete(prepared.key, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany(ctx: OperationContext): Promise<number> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).deleteMany(prepared.options);
  }

  @Collection.Get()
  async get(ctx: OperationContext): Promise<Maybe<TOutput>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).find(prepared.key, prepared.options);
  }

  @Collection.Update()
  async update(ctx: OperationContext): Promise<Maybe<TOutput>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).update(prepared.key, prepared.data, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany(ctx: OperationContext): Promise<number> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).updateMany(prepared.data, prepared.options);
  }

  @Collection.FindMany()
  async findMany(ctx: OperationContext): Promise<TOutput[]> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.findMany(prepared.options),
        service.count(prepared.options)
      ]);
      ctx.response.count = count;
      return items;
    } else
      return service.with(ctx).findMany(prepared.options);
  }

  abstract getService(ctx: OperationContext): SqbEntityService<T, TOutput> | Promise<SqbEntityService<T, TOutput>>;
}
