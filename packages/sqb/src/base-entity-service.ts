import { Maybe, Type } from 'ts-gems';
import { PartialInput, PartialOutput } from '@opra/core';
import { BadRequestError } from '@opra/exception';
import { EntityInput, EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';

export namespace BaseEntityService {
  export type SearchOptions = Repository.FindAllOptions;
  export type CountOptions = Repository.CountOptions;
  export type GetOptions = Repository.GetOptions;
  export type CreateOptions = Repository.CreateOptions;
  export type UpdateOptions = Repository.UpdateOptions;
  export type UpdateManyOptions = Repository.UpdateAllOptions;
  export type DeleteOptions = Repository.DestroyOptions;
  export type DeleteManyOptions = Repository.DestroyOptions;
}

export abstract class BaseEntityService<T, TOutput = PartialOutput<T>> {
  protected _metadata: EntityMetadata;

  protected constructor(readonly resourceType: Type<T>) {
    const metadata = EntityMetadata.get(resourceType);
    if (!metadata)
      throw new TypeError(`You must provide an SQB entity class`);
    this._metadata = metadata;
  }

  async create(
      data: PartialInput<T>,
      options?: BaseEntityService.CreateOptions,
      userContext?: any
  ): Promise<TOutput> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.create(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'create');
    return out;
  }

  async count(
      options?: BaseEntityService.SearchOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.count(options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
  }


  async delete(
      keyValue: any,
      options?: BaseEntityService.DeleteOptions,
      userContext?: any
  ): Promise<boolean> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroy(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
  }

  async deleteMany(
      options?: BaseEntityService.DeleteManyOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.destroyAll(options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
  }

  async get(
      keyValue: any,
      options?: BaseEntityService.GetOptions,
      userContext?: any
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.findByPk(keyValue, options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'findByPk');
    return out;
  }

  async search(
      options?: BaseEntityService.SearchOptions,
      userContext?: any
  ): Promise<TOutput[]> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let items: any[];
    try {
      items = await repo.findAll(options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }

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

  async update(
      keyValue: any,
      data: EntityInput<T>,
      options?: BaseEntityService.UpdateOptions,
      userContext?: any
  ): Promise<Maybe<TOutput>> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    let out;
    try {
      out = await repo.update(keyValue, data, options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
    if (out && this.onTransformRow)
      out = this.onTransformRow(out, userContext, 'create');
    return out;
  }

  async updateMany(
      data: PartialInput<T>,
      options?: BaseEntityService.UpdateManyOptions,
      userContext?: any
  ): Promise<number> {
    const conn = await this.getConnection(userContext);
    const repo = conn.getRepository(this.resourceType);
    try {
      return await repo.updateAll(data, options);
    } catch (e: any) {
      await this._onError(e);
      throw new BadRequestError(e);
    }
  }

  private async _onError(e: unknown): Promise<void> {
    if (this.onError)
      await this.onError(e);
  }

  protected abstract getConnection(userContext?: any): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient>;

  protected onError?(e: unknown): void | Promise<void>;

  protected onTransformRow?(row: TOutput, userContext: any, method: string): TOutput;

}
