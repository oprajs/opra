import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery, CollectionSearchQuery, CollectionUpdateManyQuery, CollectionUpdateQuery,
  QueryRequestContext
} from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbCollectionResource<T> {

  @Collection.CreateOperation()
  async create(ctx: QueryRequestContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseCollectionCreateQuery(ctx.query as CollectionCreateQuery);
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options, ctx.userContext);
  }

  @Collection.DeleteOperation()
  async delete(ctx: QueryRequestContext): Promise<boolean> {
    const prepared = SQBAdapter.parseCollectionDeleteQuery(ctx.query as CollectionDeleteQuery);
    const service = await this.getService(ctx);
    return service.destroy(prepared.keyValue, prepared.options, ctx.userContext);
  }

  @Collection.DeleteManyOperation()
  async deleteMany(ctx: QueryRequestContext<CollectionDeleteManyQuery>): Promise<number> {
    const prepared = SQBAdapter.parseCollectionDeleteManyQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.destroyAll(prepared.options, ctx.userContext);
  }

  @Collection.GetOperation()
  async get(ctx: QueryRequestContext<CollectionGetQuery>): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionGetQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.findByPk(prepared.keyValue, prepared.options, ctx.userContext);
  }

  @Collection.UpdateOperation()
  async update(ctx: QueryRequestContext<CollectionUpdateQuery>): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionUpdateQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.update(prepared.keyValue, prepared.data, prepared.options, ctx.userContext);
  }

  @Collection.UpdateManyOperation()
  async updateMany(ctx: QueryRequestContext<CollectionUpdateManyQuery>): Promise<number> {
    const prepared = SQBAdapter.parseCollectionUpdateManyQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.updateAll(prepared.data, prepared.options, ctx.userContext);
  }

  @Collection.SearchOperation()
  async search(ctx: QueryRequestContext<CollectionSearchQuery>): Promise<PartialOutput<T>[]> {
    const prepared = SQBAdapter.parseCollectionSearchQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.findAll(prepared.options, ctx.userContext);
  }

  abstract getService(ctx: QueryRequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;
}
