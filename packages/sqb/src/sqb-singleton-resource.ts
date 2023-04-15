import { Maybe } from 'ts-gems';
import { PartialOutput, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbSingletonResource<T> {

  @Singleton.CreateOperation()
  async create(req: Request): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseSingletonCreateRequest(req);
    const service = await this.getService(req);
    return service.for(req).create(prepared.data, prepared.options);
  }

  @Singleton.DeleteOperation()
  async delete(req: Request): Promise<boolean> {
    const prepared = SQBAdapter.parseSingletonDeleteRequest(req);
    const service = await this.getService(req);
    return !!(await service.for(req).destroyAll(prepared.options));
  }

  @Singleton.GetOperation()
  async get(req: Request): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonGetRequest(req);
    const service = await this.getService(req);
    return service.for(req).findOne(prepared.options);
  }

  @Singleton.UpdateOperation()
  async update(req: Request): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseSingletonUpdateRequest(req);
    const service = await this.getService(req);
    await service.for(req).updateAll(prepared.data, prepared.options);
    return service.for(req).findOne(prepared.options);
  }

  abstract getService<TContext>(req: TContext): SqbEntityService<T, TContext> | Promise<SqbEntityService<T, TContext>>;
}
