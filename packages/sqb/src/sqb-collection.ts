import { Maybe } from 'ts-gems';
import { ICollection, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export namespace SqbCollection {
  export interface Options {
    defaultLimit?: number;
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class SqbCollection<T> implements ICollection<T> {
  defaultLimit?: number;

  constructor(options?: SqbCollection.Options) {
    this.defaultLimit = options?.defaultLimit || 100;
  }

  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    return this._create(ctx, prepared);
  }

  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._delete(ctx, prepared);
  }

  async deleteMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._deleteMany(ctx, prepared);
  }

  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._get(ctx, prepared);
  }

  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    return this._update(ctx, prepared);
  }

  async updateMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    return this._updateMany(ctx, prepared);
  }

  async findMany?(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = await this._prepare(ctx);
    return this._findMany(ctx, prepared);
  }

  protected async _create(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<PartialOutput<T>> {
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options);
  }

  protected async _delete(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.delete(prepared.key, prepared.options);
  }

  protected async _deleteMany(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.options);
  }

  protected async _get(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.find(prepared.key, prepared.options);
  }

  protected async _update(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<Maybe<PartialOutput<T>>> {
    const service = await this.getService(ctx);
    return service.update(prepared.key, prepared.data, prepared.options);
  }

  protected async _updateMany(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<number> {
    const service = await this.getService(ctx);
    return service.updateMany(prepared.data, prepared.options);
  }

  protected async _findMany(ctx: RequestContext, prepared: SQBAdapter.TransformedRequest): Promise<PartialOutput<T>[]> {
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.findMany(prepared.options),
        service.count(prepared.options)
      ]);
      ctx.response.totalMatches = count;
      return items;
    } else
      return service.findMany(prepared.options);
  }

  protected async _prepare(ctx: RequestContext): Promise<SQBAdapter.TransformedRequest> {
    const prepared = SQBAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  onPrepare?(ctx: RequestContext,
             prepared: SQBAdapter.TransformedRequest): SQBAdapter.TransformedRequest | Promise<SQBAdapter.TransformedRequest>;

  protected abstract getService(ctx: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;

}
