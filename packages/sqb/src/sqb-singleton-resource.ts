import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { EndpointContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.Create()
  async create(ctx: EndpointContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).create(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete(ctx: EndpointContext): Promise<boolean> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return !!(await service.with(ctx).deleteMany(prepared.options));
  }

  @Singleton.Get()
  async get(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).findOne(prepared.options);
  }

  @Singleton.Update()
  async update(ctx: EndpointContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.with(ctx).updateMany(prepared.data, prepared.options);
    return service.with(ctx).findOne(prepared.options);
  }

  abstract getService(req: EndpointContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
