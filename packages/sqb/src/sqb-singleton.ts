import { Maybe } from 'ts-gems';
import { ISingleton, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingleton<T> implements ISingleton<T> {

  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    return this._create(ctx, prepared);
  }

  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._delete(ctx, prepared);
  }

  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._get(ctx, prepared);
  }

  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._update(ctx, prepared);
  }

  protected async _create(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<PartialOutput<T>> {
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options);
  }

  protected async _delete(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return await service.deleteMany(prepared.options);
  }

  protected async _get(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.findOne(prepared.options);
  }

  protected async _update(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
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
