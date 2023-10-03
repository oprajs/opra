import { Maybe, Type } from 'ts-gems';
import { PartialInput, PartialOutput, RequestContext } from '@opra/core';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export namespace SqbEntityService {
  export interface Options {
    db?: SqbClient | SqbConnection;
    defaultLimit?: number;
  }
}

export class SqbEntityService<T, TOutput = PartialOutput<T>> {
  context: RequestContext;
  defaultLimit: number;
  db?: SqbClient | SqbConnection;

  constructor(readonly typeClass: Type<T>, options?: SqbEntityService.Options) {
    const metadata = EntityMetadata.get(typeClass);
    if (!metadata)
      throw new TypeError(`Class ${typeClass} is not decorated with $Entity() decorator`);
    this.db = options?.db;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  async count(
      options?: Repository.CountOptions
  ): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.count(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async create(
      data: PartialInput<T>,
      options?: Repository.CreateOptions
  ): Promise<TOutput> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let out;
    try {
      out = await repo.create(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.transformData)
      out = this.transformData(out);
    if (!out)
      throw new Error('"create" endpoint returned no result!');
    return out;
  }


  async delete(
      keyValue: any,
      options?: Repository.DestroyOptions
  ): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.delete(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async deleteMany(
      options?: Repository.DestroyOptions
  ): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.deleteMany(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async find(
      keyValue: any,
      options?: Repository.FindOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let out;
    try {
      out = await repo.find(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.transformData)
      out = this.transformData(out);
    return out;
  }

  async findOne(
      options?: Repository.FindOneOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let out;
    try {
      out = await repo.findOne(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.transformData)
      out = this.transformData(out);
    return out;
  }

  async findMany(
      options?: Repository.FindManyOptions,
  ): Promise<TOutput[]> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let items: any[];
    try {
      items = await repo.findMany(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }

    if (items.length && this.transformData) {
      const newItems: any[] = [];
      for (const item of items) {
        const v = this.transformData(item);
        if (v)
          newItems.push(v);
      }
      return newItems;
    }
    return items;
  }

  async exists(
      options?: Repository.ExistsOptions
  ): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.exists(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }


  async update(
      keyValue: any,
      data: EntityInput<T>,
      options?: Repository.UpdateOptions
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let out;
    try {
      out = await repo.update(keyValue, data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (out && this.transformData)
      out = this.transformData(out);
    return out;
  }

  async updateMany(
      data: PartialInput<T>,
      options?: Repository.UpdateManyOptions
  ): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.updateMany(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  with(
      context: RequestContext,
      db?: SqbClient | SqbConnection
  ): SqbEntityService<T, TOutput> {
    if (this.context === context && this.db === db)
      return this;
    const instance = {context} as SqbEntityService<T, TOutput>;
    // Should reset session if db changed
    if (db) {
      instance.db = db;
    }
    Object.setPrototypeOf(instance, this);
    return instance;
  }

  protected async _onError(error: unknown): Promise<void> {
    if (this.onError)
      await this.onError(error);
  }

  protected getConnection(): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient> {
    if (!this.context)
      throw new Error(`Context not set!`);
    if (!this.db)
      throw new Error(`Database not set!`);
    return this.db;
  }

  protected onError?(error: unknown): void | Promise<void>;

  protected transformData?(row: TOutput): TOutput;


}
