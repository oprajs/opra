import { Type } from 'ts-gems';
import { DTO, PartialDTO, PatchDTO } from '@opra/common';
import { EntityInput, Repository } from '@sqb/connect';
import { SqbEntityServiceBase } from './sqb-entity-service-base.js';

export namespace SqbEntityService {
  export interface Options extends SqbEntityServiceBase.Options {
  }
}

export class SqbEntityService<T> extends SqbEntityServiceBase<T> {

  constructor(readonly typeClass: Type<T>, options?: SqbEntityService.Options) {
    super(typeClass, options);
  }

  async count(options?: Repository.CountOptions): Promise<number> {
    return super._count(options);
  }

  async create(data: DTO<T>, options?: Repository.CreateOptions): Promise<PartialDTO<T>> {
    return super._create(data, options);
  }

  async delete(keyValue: any, options?: Repository.DeleteOptions): Promise<number> {
    return super._delete(keyValue, options);
  }

  async deleteMany(options?: Repository.DeleteManyOptions): Promise<number> {
    return super._deleteMany(options);
  }

  async find(keyValue: any, options?: Repository.FindOptions): Promise<PartialDTO<T> | undefined> {
    return super._find(keyValue, options);
  }

  async findOne(options?: Repository.FindOneOptions): Promise<PartialDTO<T> | undefined> {
    return super._findOne(options);
  }

  async findMany(options?: Repository.FindManyOptions): Promise<PartialDTO<T>[]> {
    return super._findMany(options);
  }

  async exists(options?: Repository.ExistsOptions): Promise<boolean> {
    return super._exists(options);
  }

  async update(keyValue: any, data: EntityInput<T>, options?: Repository.UpdateOptions): Promise<PartialDTO<T> | undefined> {
    return super._update(keyValue, data, options);
  }

  async updateMany(
      data: PatchDTO<T>,
      options?: Repository.UpdateManyOptions
  ): Promise<number> {
    return super._updateMany(data, options);
  }

}
