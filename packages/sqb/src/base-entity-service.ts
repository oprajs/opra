import { Maybe, Type } from 'ts-gems';
import { ExecutionContext, IEntityService } from '@opra/core';
import { EntityInput, EntityMetadata, EntityOutput, Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { SQBAdapter } from './sqb-adapter.js';

export namespace BaseEntityService {
  export type FindAllOptions = Repository.FindAllOptions & { total?: boolean };
  export type FindOneOptions = Repository.FindOneOptions;
  export type CreateOptions = Repository.CreateOptions;
  export type UpdateOptions = Repository.UpdateOptions;
  export type UpdateManyOptions = Repository.UpdateAllOptions;
  export type DeleteOptions = Repository.DestroyOptions;
  export type DeleteManyOptions = Repository.DestroyOptions;
}

export abstract class BaseEntityService<T> implements IEntityService {
  protected _metadata: EntityMetadata;

  protected constructor(readonly resourceType: Type<T>) {
    const metadata = EntityMetadata.get(resourceType);
    if (!metadata)
      throw new TypeError(`You must provide an SQB entity class`);
    this._metadata = metadata;
  }

  async processRequest(ctx: ExecutionContext) {
    const prepared = SQBAdapter.prepare(ctx.request);
    switch (prepared.method) {
      case 'findAll':
        return this.search(prepared.options, ctx.userContext);
      case 'findByPk':
        return this.get(ctx, prepared.options);
      default:
        throw new TypeError(`Unimplemented method (${prepared.method})`)
    }
  }

  async get(
      keyValue: any,
      options?: BaseEntityService.FindOneOptions,
      userContext?: any
  ): Promise<Maybe<EntityOutput<T>>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out = await repo.findByPk(keyValue, options);
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'findByPk');
    return out;
  }

  async count(
      options?: BaseEntityService.FindAllOptions,
      userContext?: any
  ): Promise<Maybe<number>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    return await repo.count(options);
  }

  async search(
      options?: BaseEntityService.FindAllOptions,
      userContext?: any
  ): Promise<Maybe<EntityOutput<T>>[]> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    const items = await repo.findAll(options);
    if (items.length && this.onTransformRow) {
      const newItems: any[] = [];
      for (const item of items) {
        const v = this.onTransformRow(item, userContext, 'search');
        if (v)
          newItems.push(v);
      }
      return newItems;
    }
    return items;
  }

  async create(
      data: EntityInput<T>,
      options?: BaseEntityService.CreateOptions,
      userContext?: any
  ): Promise<Maybe<EntityOutput<T>>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out = await repo.create(data, options);
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'create');
    return out;
  }

  async update(
      keyValue: any,
      data: EntityInput<T>,
      options?: BaseEntityService.UpdateOptions,
      userContext?: any
  ): Promise<Maybe<EntityOutput<T>>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out = await repo.update(keyValue, data, options);
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'create');
    return out;
  }

  async updateMany(
      data: EntityInput<T>,
      options?: BaseEntityService.UpdateManyOptions,
      userContext?: any
  ): Promise<Maybe<number>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    return await repo.updateAll(data, options);
  }

  async delete(
      keyValue: any,
      options?: BaseEntityService.DeleteOptions,
      userContext?: any
  ): Promise<boolean> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    return await repo.destroy(keyValue, options);
  }

  async deleteMany(
      options?: BaseEntityService.DeleteManyOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    return await repo.destroyAll(options);
  }

  protected abstract getConnection(userContext?: any): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onTransformRow?(row: EntityOutput<T>, userContext: any, method: string): EntityOutput<T>;

}
