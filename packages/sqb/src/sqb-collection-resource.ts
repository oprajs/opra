import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbCollectionResource<T> {

  @Collection.CreateOperation()
  async create(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseCollectionCreateRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.create(ctx, prepared.data, prepared.options);
  }

  @Collection.DeleteOperation()
  async delete(ctx: RequestContext): Promise<boolean> {
    const prepared = SQBAdapter.parseCollectionDeleteRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.destroy(ctx, prepared.key, prepared.options);
  }

  @Collection.DeleteManyOperation()
  async deleteMany(ctx: RequestContext): Promise<number> {
    const prepared = SQBAdapter.parseCollectionDeleteManyRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.destroyAll(ctx, prepared.options);
  }

  @Collection.GetOperation()
  async get(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionGetRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findByPk(ctx, prepared.key, prepared.options);
  }

  @Collection.UpdateOperation()
  async update(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionUpdateRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.update(ctx, prepared.key, prepared.data, prepared.options);
  }

  @Collection.UpdateManyOperation()
  async updateMany(ctx: RequestContext): Promise<number> {
    const prepared = SQBAdapter.parseCollectionUpdateManyRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.updateAll(ctx, prepared.data, prepared.options);
  }

  @Collection.SearchOperation()
  async search(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = SQBAdapter.parseCollectionSearchRequest(ctx.request);
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.findAll(prepared.options),
        service.count(prepared.options)
      ]);
      ctx.response.count = count;
      return items;
    } else
      return service.findAll(ctx, prepared.options);
  }

  abstract getService(ctx: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;
}
