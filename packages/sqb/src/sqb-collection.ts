import { Maybe } from 'ts-gems';
import { Collection, ICollection, PartialOutput } from '@opra/common';
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

  @Collection.Create()
  async create?(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.delete(prepared.key, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.options);
  }

  @Collection.Get()
  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.find(prepared.key, prepared.options);
  }

  @Collection.Update()
  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.update(prepared.key, prepared.data, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.data, prepared.options);
  }

  @Collection.FindMany()
  async findMany?(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.findMany(prepared.options),
        service.count(prepared.options)
      ]);
      ctx.response.count = count;
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
