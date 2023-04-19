import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.CreateOperation()
  async create(ctx: RequestContext): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseSingletonCreateRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.create(ctx, prepared.data, prepared.options);
  }

  @Singleton.DeleteOperation()
  async delete(ctx: RequestContext): Promise<boolean> {
    const prepared = SQBAdapter.parseSingletonDeleteRequest(ctx.request);
    const service = await this.getService(ctx);
    return !!(await service.destroyAll(ctx, prepared.options));
  }

  @Singleton.GetOperation()
  async get(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonGetRequest(ctx.request);
    const service = await this.getService(ctx);
    return service.findOne(ctx, prepared.options);
  }

  @Singleton.UpdateOperation()
  async update(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonUpdateRequest(ctx.request);
    const service = await this.getService(ctx);
    await service.updateAll(ctx, prepared.data, prepared.options);
    return service.findOne(ctx, prepared.options);
  }

  abstract getService(req: RequestContext): SqbEntityService<T> | Promise<SqbEntityService<T>>;
}
