import { Maybe } from 'ts-gems';
import { Collection, PartialOutput } from '@opra/common';
import { Request } from '@opra/core';
import { SQBAdapter } from './sqb-adapter.js';
import { SqbEntityService } from './sqb-entity-service.js';

export abstract class SqbCollectionResource<T> {

  @Collection.CreateOperation()
  async create(req: Request): Promise<PartialOutput<T>> {
    const prepared = SQBAdapter.parseCollectionCreateRequest(req);
    const service = await this.getService(req);
    return service.for(req).create(prepared.data, prepared.options);
  }

  @Collection.DeleteOperation()
  async delete(req: Request): Promise<boolean> {
    const prepared = SQBAdapter.parseCollectionDeleteRequest(req);
    const service = await this.getService(req);
    return service.for(req).destroy(prepared.key, prepared.options);
  }

  @Collection.DeleteManyOperation()
  async deleteMany(req: Request): Promise<number> {
    const prepared = SQBAdapter.parseCollectionDeleteManyRequest(req);
    const service = await this.getService(req);
    return service.for(req).destroyAll(prepared.options);
  }

  @Collection.GetOperation()
  async get(req: Request): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionGetRequest(req);
    const service = await this.getService(req);
    return service.for(req).findByPk(prepared.key, prepared.options);
  }

  @Collection.UpdateOperation()
  async update(req: Request): Promise<Maybe<PartialOutput<T>>> {
    const prepared = SQBAdapter.parseCollectionUpdateRequest(req);
    const service = await this.getService(req);
    return service.for(req).update(prepared.key, prepared.data, prepared.options);
  }

  @Collection.UpdateManyOperation()
  async updateMany(req: Request): Promise<number> {
    const prepared = SQBAdapter.parseCollectionUpdateManyRequest(req);
    const service = await this.getService(req);
    return service.for(req).updateAll(prepared.data, prepared.options);
  }

  @Collection.SearchOperation()
  async search(req: Request): Promise<PartialOutput<T>[]> {
    const prepared = SQBAdapter.parseCollectionSearchRequest(req);
    const service = await this.getService(req);
    return service.for(req).findAll(prepared.options);
  }

  abstract getService<TContext>(req: TContext): SqbEntityService<T, TContext> | Promise<SqbEntityService<T, TContext>>;
}
