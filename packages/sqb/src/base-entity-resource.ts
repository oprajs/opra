import { ICollectionResource, SingleRequestContext } from '@opra/core';
import { BaseEntityService } from './base-entity-service.js';
import { SQBAdapter } from './sqb-adapter.js';

export abstract class BaseEntityResource<T> implements ICollectionResource<T> {

  async create(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).create(prepared.values, prepared.options, ctx.userContext);
  }

  async count(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).count(prepared.options, ctx.userContext);
  }

  async delete(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).delete(prepared.keyValue, prepared.options, ctx.userContext);
  }

  async deleteMany(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).deleteMany(prepared.options, ctx.userContext);
  }

  async get(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).get(prepared.keyValue, prepared.options, ctx.userContext);
  }

  async search(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).search(prepared.options, ctx.userContext);
  }

  async update(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).update(prepared.keyValue, prepared.values, prepared.options, ctx.userContext);
  }

  async updateMany(ctx: SingleRequestContext) {
    const prepared = SQBAdapter.prepare(ctx.query);
    return (await this.getService(ctx)).updateMany(prepared.values, prepared.options, ctx.userContext);
  }

  abstract getService(ctx: SingleRequestContext): BaseEntityService<T> | Promise<BaseEntityService<T>>;
}
