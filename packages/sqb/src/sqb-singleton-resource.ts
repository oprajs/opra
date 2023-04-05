import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import {
  QueryRequestContext,
  SingletonCreateQuery,
  SingletonDeleteQuery,
  SingletonGetQuery,
  SingletonUpdateQuery
} from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.CreateOperation()
  async create(ctx: QueryRequestContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseSingletonCreateQuery(ctx.query as SingletonCreateQuery);
    const service = await this.getService(ctx);
    return service.create(prepared.data, prepared.options, ctx.userContext);
  }

  @Singleton.DeleteOperation()
  async delete(ctx: QueryRequestContext): Promise<boolean> {
    const prepared = SQBAdapter.parseSingletonDeleteQuery(ctx.query as SingletonDeleteQuery);
    const service = await this.getService(ctx);
    return !!(await service.destroyAll(prepared.options, ctx.userContext));
  }

  @Singleton.GetOperation()
  async get(ctx: QueryRequestContext<SingletonGetQuery>): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonGetQuery(ctx.query);
    const service = await this.getService(ctx);
    return service.findOne(prepared.options, ctx.userContext);
  }

  @Singleton.UpdateOperation()
  async update(ctx: QueryRequestContext<SingletonUpdateQuery>): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonUpdateQuery(ctx.query);
    const service = await this.getService(ctx);
    await service.updateAll(prepared.data, prepared.options, ctx.userContext);
    return service.findOne(prepared.options);
  }

  abstract getService(ctx: QueryRequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;
}
