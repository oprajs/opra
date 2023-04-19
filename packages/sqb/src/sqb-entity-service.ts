import { Maybe, Type } from 'ts-gems';
import { PartialInput, PartialOutput, RequestContext } from '@opra/core';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export abstract class SqbEntityService<T, TOutput = PartialOutput<T>> {
  protected _entityMetadata: EntityMetadata;

  protected constructor(readonly resourceType: Type<T>) {
    const metadata = EntityMetadata.get(resourceType);
    if (!metadata)
      throw new TypeError(`You must provide an SQB entity class`);
    this._entityMetadata = metadata;
  }

  async create(
      context: RequestContext,
      data: PartialInput<T>,
      options?: Repository.CreateOptions
  ): Promise<TOutput> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.create(data, options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(context, out, 'create');
    return out;
  }

  async count(
      context: RequestContext,
      options?: Repository.CountOptions
  ): Promise<number> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.count(options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
  }

  async destroy(
      context: RequestContext,
      keyValue: any,
      options?: Repository.DestroyOptions
  ): Promise<boolean> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroy(keyValue, options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
  }

  async destroyAll(
      context: RequestContext,
      options?: Repository.DestroyOptions
  ): Promise<number> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroyAll(options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
  }

  async findByPk(
      context: RequestContext,
      keyValue: any,
      options?: Repository.GetOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.findByPk(keyValue, options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(context, out, 'read');
    return out;
  }

  async findOne(
      context: RequestContext,
      options?: Repository.FindOneOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.findOne(options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(context, out, 'read');
    return out;
  }

  async findAll(
      context: RequestContext,
      options?: Repository.FindAllOptions,
  ): Promise<TOutput[]> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    let items: any[];
    try {
      items = await repo.findAll(options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }

    if (items.length && this.onTransformRow) {
      const newItems: any[] = [];
      for (const item of items) {
        const v = this.onTransformRow(context, item, 'read');
        if (v)
          newItems.push(v);
      }
      return newItems;
    }
    return items;
  }

  async update(
      context: RequestContext,
      keyValue: any,
      data: EntityInput<T>,
      options?: Repository.UpdateOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.update(keyValue, data, options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(context, out, 'update');
    return out;
  }

  async updateAll(
      context: RequestContext,
      data: PartialInput<T>,
      options?: Repository.UpdateAllOptions
  ): Promise<number> {
    const conn = await this.getConnection(context);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.updateAll(data, options);
    } catch (e: any) {
      await this._onError(context, e);
      throw e;
    }
  }

  protected async _onError(context: RequestContext, error: unknown): Promise<void> {
    if (this.onError)
      await this.onError(context, error);
  }

  protected abstract getConnection(context: RequestContext): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onError?(context: RequestContext, error: unknown): void | Promise<void>;

  protected onTransformRow?(context: RequestContext, row: TOutput, method: string): TOutput;


}
