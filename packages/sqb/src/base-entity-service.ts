import { Type } from 'ts-gems';
import { ExecutionContext, IEntityService } from '@opra/core';
import { OpraSchema } from '@opra/schema';
import { EntityMetadata, EntityOutput, Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { SQBAdapter } from './sqb-adapter.js';

export namespace BaseEntityService {
  export type FindAllOptions = Repository.FindAllOptions & { total?: boolean };
  export type FindOneOptions = Repository.FindOneOptions;
}

export abstract class BaseEntityService<TResource> implements IEntityService {
  protected _metadata: EntityMetadata;

  protected constructor(readonly resourceType: Type<TResource>) {
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
  ): Promise<EntityOutput<TResource> | undefined> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let value = await repo.findByPk(keyValue, options);
    if (value && this.onTransformRow)
      value = this.onTransformRow(value, userContext, 'findByPk');
    return value;
  }

  async search(
      options?: BaseEntityService.FindAllOptions,
      userContext?: any
  ): Promise<OpraSchema.EntitySearchResult> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    const items = await repo.findAll(options);
    const out: OpraSchema.EntitySearchResult = {
      items,
      offset: options?.offset || 0
    }
    if (items.length && this.onTransformRow) {
      const newItems: any[] = [];
      for (const item of items) {
        const v = this.onTransformRow(item, userContext, 'search');
        if (v)
          newItems.push(v);
      }
      out.items = newItems;
    }
    if (options?.total)
      out.total = await repo.count(options);
    if (options?.distinct)
      out.distinct = true;
    return out;
  }

  protected abstract getConnection(userContext?: any): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onTransformRow?(row: EntityOutput<TResource>, userContext: any, method: string): EntityOutput<TResource>;

}
