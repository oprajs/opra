import { ICollectionResource, QueryContext } from '@opra/core';
import { BaseEntityService } from './base-entity-service.js';
import { SQBAdapter } from './sqb-adapter.js';

export abstract class BaseEntityResource<T> implements ICollectionResource<T> {

  async create(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).create(prepared.values, prepared.options, ctx.userContext);
  }

  async count(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).count(prepared.options, ctx.userContext);
  }

  async delete(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).delete(prepared.keyValue, prepared.options, ctx.userContext);
  }

  async deleteMany(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).deleteMany(prepared.options, ctx.userContext);
  }

  async get(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).get(prepared.keyValue, prepared.options, ctx.userContext);
  }

  async search(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).search(prepared.options, ctx.userContext);
  }

  async update(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).update(prepared.keyValue, prepared.values, prepared.options, ctx.userContext);
  }

  async updateMany(ctx: QueryContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).updateMany(prepared.values, prepared.options, ctx.userContext);
  }

  abstract getService(ctx: QueryContext): BaseEntityService<T> | Promise<BaseEntityService<T>>;
}
