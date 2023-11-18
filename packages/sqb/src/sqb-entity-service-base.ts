import { Maybe, Type } from 'ts-gems';
import { ApiService, PartialInput, PartialOutput, RequestContext } from '@opra/core';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export namespace SqbEntityServiceBase {
  export interface Options {
    db?: SqbClient | SqbConnection;
    defaultLimit?: number;
  }
}

export class SqbEntityServiceBase<T> extends ApiService {
  defaultLimit: number;
  db?: SqbClient | SqbConnection;

  constructor(readonly typeClass: Type<T>, options?: SqbEntityServiceBase.Options) {
    super();
    const metadata = EntityMetadata.get(typeClass);
    if (!metadata)
      throw new TypeError(`Class ${typeClass} is not decorated with $Entity() decorator`);
    this.db = options?.db;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  protected async _count(
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

  protected async _create(data: PartialInput<T>, options?: Repository.CreateOptions): Promise<PartialOutput<T>> {
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


  protected async _delete(keyValue: any, options?: Repository.DeleteOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.delete(keyValue, options) ? 1 : 0;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _deleteMany(options?: Repository.DeleteManyOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.deleteMany(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _find(keyValue: any, options?: Repository.FindOptions): Promise<Maybe<PartialOutput<T>>> {
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

  protected async _findOne(options?: Repository.FindOneOptions): Promise<Maybe<PartialOutput<T>>> {
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

  protected async _findMany(options?: Repository.FindManyOptions): Promise<PartialOutput<T>[]> {
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

  protected async _exists(options?: Repository.ExistsOptions): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.exists(options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }


  protected async _update(keyValue: any, data: EntityInput<T>, options?: Repository.UpdateOptions): Promise<Maybe<PartialOutput<T>>> {
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

  protected async _updateMany(
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

  forContext(context: RequestContext, options?: {
    newInstance?: boolean,
    db?: SqbClient | SqbConnection
  }): this {
    return super.forContext(context, {
      newInstance: options?.newInstance ||
          (options?.db && this.db !== options.db)
    }) as this;
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

  protected transformData?(row: PartialOutput<T>): PartialOutput<T>;


}
