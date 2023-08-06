import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { OperationContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.Create()
  async create(ctx: OperationContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).create(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete(ctx: OperationContext): Promise<boolean> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return !!(await service.with(ctx).deleteMany(prepared.options));
  }

  @Singleton.Get()
  async get(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.with(ctx).findOne(prepared.options);
  }

  @Singleton.Update()
  async update(ctx: OperationContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.with(ctx).updateMany(prepared.data, prepared.options);
    return service.with(ctx).findOne(prepared.options);
  }

  abstract getService(req: OperationContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
