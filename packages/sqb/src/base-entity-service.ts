import { Type } from 'ts-gems';
import { ExecutionContext } from '@opra/core';
import { OpraSchema } from '@opra/schema';
import { EntityMetadata, EntityOutput, Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { SQBAdapter } from './sqb-adapter.js';

export namespace BaseEntityService {
  export type FindAllOptions = Repository.FindAllOptions & { total?: boolean };
  export type FindOneOptions = Repository.FindOneOptions;
}

export abstract class BaseEntityService<TResource> {
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
        return this.findAll(ctx, prepared.options);
      case 'findByPk':
        return this.findByPk(ctx, prepared.options);
      default:
        throw new TypeError(`Unimplemented method (${prepared.method})`)
    }
  }

  async findByPk(ctx: ExecutionContext, keyValue: any, options?: BaseEntityService.FindOneOptions
  ): Promise<EntityOutput<TResource> | undefined> {
    const conn = await this.getConnection(ctx);
    const repo = conn.getRepository(this.resourceType);
    let value = await repo.findByPk(keyValue, options);
    if (value && this.onTransformRow)
      value = this.onTransformRow(ctx, value, 'findByPk');
    return value;
  }

  async findAll(ctx: ExecutionContext, options?: BaseEntityService.FindAllOptions): Promise<OpraSchema.EntitySearchResult> {
    const conn = await this.getConnection(ctx);
    const repo = conn.getRepository(this.resourceType);
    const value = await repo.findAll(options);
    const out: OpraSchema.EntitySearchResult = {
      value,
      offset: options?.offset || 0
    }
    if (value.length && this.onTransformRow) {
      const newItems: any[] = [];
      for (const item of value) {
        const v = this.onTransformRow(ctx, item, 'search');
        if (v)
          newItems.push(v);
      }
      out.value = newItems;
    }
    if (options?.total)
      out.total = await repo.count(options);
    if (options?.distinct)
      out.distinct = true;
    return out;
  }

  protected abstract getConnection(ctx: ExecutionContext): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onTransformRow?(context: ExecutionContext, row: EntityOutput<TResource>, method: string): EntityOutput<TResource>;

}
