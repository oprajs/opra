import { Maybe, Type } from 'ts-gems';
import { PartialInput, PartialOutput } from '@opra/core';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export abstract class SqbEntityService<T, TContext = never, TOutput = PartialOutput<T>> {
  protected _entityMetadata: EntityMetadata;
  protected _context: TContext;

  protected constructor(readonly resourceType: Type<T>) {
    const metadata = EntityMetadata.get(resourceType);
    if (!metadata)
      throw new TypeError(`You must provide an SQB entity class`);
    this._entityMetadata = metadata;
  }

  for(context: TContext): SqbEntityService<T, TContext, TOutput> {
    const newScope = Object.create(this);
    newScope._context = context;
    return newScope;
  }

  async create(
      data: PartialInput<T>,
      options?: Repository.CreateOptions
  ): Promise<TOutput> {
    const conn = await this.getConnection(this._context);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.create(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, 'create', this._context);
    return out;
  }

  async count(
      options?: Repository.CountOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.count(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async destroy(
      keyValue: any,
      options?: Repository.DestroyOptions,
      userContext?: any
  ): Promise<boolean> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroy(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async destroyAll(
      options?: Repository.DestroyOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroyAll(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async findByPk(
      keyValue: any,
      options?: Repository.GetOptions,
      userContext?: any
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.findByPk(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, 'read', this._context);
    return out;
  }

  async findOne(
      options?: Repository.FindOneOptions,
      userContext?: any
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.findOne(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, 'read', this._context);
    return out;
  }

  async findAll(
      options?: Repository.FindAllOptions,
      userContext?: any
  ): Promise<TOutput[]> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let items: any[];
    try {
      items = await repo.findAll(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }

    if (items.length && this.onTransformRow) {
      const newItems: any[] = [];
      for (const item of items) {
        const v = this.onTransformRow(item, 'read', this._context);
        if (v)
          newItems.push(v);
      }
      return newItems;
    }
    return items;
  }

  async update(
      keyValue: any,
      data: EntityInput<T>,
      options?: Repository.UpdateOptions,
      userContext?: any
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.update(keyValue, data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, 'update', this._context);
    return out;
  }

  async updateAll(
      data: PartialInput<T>,
      options?: Repository.UpdateAllOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.updateAll(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _onError(e: unknown): Promise<void> {
    if (this.onError)
      await this.onError(e);
  }

  protected abstract getConnection(context: TContext): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onError?(e: unknown): void | Promise<void>;

  protected onTransformRow?(row: TOutput, method: string, context: TContext): TOutput;


}
