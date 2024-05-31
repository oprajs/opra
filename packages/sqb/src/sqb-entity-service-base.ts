import { Nullish, Type } from 'ts-gems';
import { DTO, PartialDTO, PatchDTO } from '@opra/common';
import { ServiceBase, HttpContext } from '@opra/core';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export class SqbEntityServiceBase<T> extends ServiceBase {
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

  protected async _create(data: DTO<T>, options?: Repository.CreateOptions): Promise<PartialDTO<T>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    let out;
    try {
      out = await repo.create(data as any, options);
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

  protected async _find(keyValue: any, options?: Repository.FindOptions): Promise<PartialDTO<T> | undefined> {
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

  protected async _findOne(options?: Repository.FindOneOptions): Promise<PartialDTO<T> | undefined> {
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

  protected async _findMany(options?: Repository.FindManyOptions): Promise<PartialDTO<T>[]> {
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


  protected async _update(keyValue: any, data: EntityInput<T>, options?: Repository.UpdateOptions): Promise<PartialDTO<T> | undefined> {
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
      data: PatchDTO<T>,
      options?: Repository.UpdateManyOptions
  ): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.typeClass);
    try {
      return await repo.updateMany(data as any, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  for<C extends HttpContext, P extends Partial<this>>(
      context: C,
      overwriteProperties?: Nullish<P>,
      overwriteContext?: Partial<C>
  ): this & Required<P> {
    return super.for(context, overwriteProperties, overwriteContext) as this & Required<P>;
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

  protected transformData?(row: PartialDTO<T>): PartialDTO<T>;


}

export namespace SqbEntityServiceBase {
  export interface Options {
    db?: SqbClient | SqbConnection;
    defaultLimit?: number;
  }
}
