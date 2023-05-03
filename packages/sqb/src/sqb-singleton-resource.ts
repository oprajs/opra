import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.Create()
  async create(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.create(ctx, prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete(ctx: RequestContext): Promise<boolean> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return !!(await service.deleteMany(ctx, prepared.options));
  }

  @Singleton.Get()
  async get(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(ctx, prepared.options);
  }

  @Singleton.Update()
  async update(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.updateMany(ctx, prepared.data, prepared.options);
    return service.findOne(ctx, prepared.options);
  }

  abstract getService(req: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
