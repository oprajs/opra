import mongodb, { UpdateFilter } from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { PartialOutput } from '@opra/core';
import { MongoEntityServiceBase } from './mongo-entity-service-base.js';

export namespace MongoEntityService {
  export interface Options extends MongoEntityServiceBase.Options {
  }
}

export class MongoEntityService<T extends mongodb.Document> extends MongoEntityServiceBase<T> {

  constructor(options?: MongoEntityService.Options)
  constructor(collectionName: string, options?: MongoEntityService.Options)
  constructor(arg0, arg1?) {
    super(arg0, arg1);
  }

  async count(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    return super._count(filter, options);
  }

  async deleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
    return super._deleteOne(filter, options);
  }

  async deleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
    return super._deleteMany(filter, options);
  }

  async findOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T> | undefined> {
    return super._findOne(filter, options);
  }

  async find(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T>[]> {
    return super._find(filter, options);
  }

  async insertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions): Promise<PartialOutput<T>> {
    return super._insertOne(doc, options);
  }

  async updateOne(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: mongodb.UpdateOptions
  ): Promise<PartialOutput<T> | undefined> {
    return this._updateOne(filter, doc, options);
  }

  async updateMany(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>
  ): Promise<number> {
    return super._updateMany(filter, doc, options);
  }

}
