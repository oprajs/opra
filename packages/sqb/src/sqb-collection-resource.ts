import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbCollectionResource<T> {

  @Collection.Create()
  async create(ctx: RequestContext): Promise<PartialOutput<T>> {
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
  async find(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).find(prepared.key, prepared.options);
  }

  @Collection.Update()
  async update(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
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
  async search(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.findAll(prepared.options),
        service.count(prepared.options)
      ]);
      ctx.response.count = count;
      return items;
    } else
      return service.with(ctx).findAll(prepared.options);
  }

  abstract getService(ctx: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;
}
