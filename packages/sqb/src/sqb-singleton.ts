import { Maybe } from 'ts-gems';
import { ISingleton, PartialDTO } from '@opra/common';
import { HttpContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingleton<T> implements ISingleton<T> {

  async create?(ctx: HttpContext): Promise<PartialDTO<T>> {
    const prepared = await this._prepare(ctx);
    return this._create(ctx, prepared);
  }

  async delete?(ctx: HttpContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._delete(ctx, prepared);
  }

  async get?(ctx: HttpContext): Promise<Maybe<PartialDTO<T>>> {
    const prepared = await this._prepare(ctx);
    return this._get(ctx, prepared);
  }

  async update?(ctx: HttpContext): Promise<Maybe<PartialDTO<T>>> {
    const prepared = await this._prepare(ctx);
    return this._update(ctx, prepared);
  }

  protected async _create(ctx: HttpContext, prepared: SQBAdapter.TransformedRequest): Promise<PartialDTO<T>> {
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options);
  }

  protected async _delete(ctx: HttpContext, prepared: SQBAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return await service.deleteMany(prepared.options);
  }

  protected async _get(ctx: HttpContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialDTO<T>>> {
    const service = await this.getService(ctx);
    return service.findOne(prepared.options);
  }

  protected async _update(ctx: HttpContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialDTO<T>>> {
    const service = await this.getService(ctx);
    await service.updateMany(prepared.data, prepared.options);
    return service.findOne(prepared.options);
  }

  protected async _prepare(ctx: HttpContext): Promise<SQBAdapter.TransformedRequest> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  onPrepare?(ctx: HttpContext,
             prepared: SQBAdapter.TransformedRequest): SQBAdapter.TransformedRequest | Promise<SQBAdapter.TransformedRequest>;

  protected abstract getService(ctx: HttpContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
