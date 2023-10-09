import { Maybe } from 'ts-gems';
import { ISingleton, PartialOutput, Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingleton<T> implements ISingleton<T> {

  @Singleton.Create()
  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options);
  }

  @Singleton.Delete()
  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return await service.deleteMany(prepared.options);
  }

  @Singleton.Get()
  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.findOne(prepared.options);
  }

  @Singleton.Update()
  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    await service.updateMany(prepared.data, prepared.options);
    return service.findOne(prepared.options);
  }

  protected async _prepare(ctx: RequestContext): Promise<SQBAdapter.TransformedRequest> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  onPrepare?(ctx: RequestContext,
             prepared: SQBAdapter.TransformedRequest): SQBAdapter.TransformedRequest | Promise<SQBAdapter.TransformedRequest>;

  protected abstract getService(ctx: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
