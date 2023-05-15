import { Maybe } from 'ts-gems';
import { Collection, PartialOutput, ResourceNotFoundError } from '@opra/common';
import { CollectionResourceBase, RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export namespace SqbCollectionResource {
  export interface Options extends CollectionResourceBase.Options {
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class SqbCollectionResource<T, TOutput = PartialOutput<T>> extends CollectionResourceBase {

  constructor(options?: SqbCollectionResource.Options) {
    super(options);
  }

  @Collection.Create()
  async create(ctx: RequestContext): Promise<TOutput> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).create(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete(ctx: RequestContext): Promise<boolean> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).delete(prepared.key, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany(ctx: RequestContext): Promise<number> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).deleteMany(prepared.options);
  }

  @Collection.Get()
  async find(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).find(prepared.key, prepared.options);
  }

  @Collection.Update()
  async update(ctx: RequestContext): Promise<Maybe<TOutput>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).update(prepared.key, prepared.data, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany(ctx: RequestContext): Promise<number> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).updateMany(prepared.data, prepared.options);
  }

  @Collection.FindMany()
  async findMany(ctx: RequestContext): Promise<TOutput[]> {
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

  abstract getService(ctx: RequestContext): SqbEntityService<T, TOutput> | Promise<SqbEntityService<T, TOutput>>;
}
