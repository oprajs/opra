import mongodb, { UpdateFilter } from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { ApiService, PartialOutput, RequestContext } from '@opra/core';

export namespace MongoServiceBase {
  export interface Options {
    db?: mongodb.Db;
  }
}

export class MongoServiceBase<T extends mongodb.Document> extends ApiService {
  protected _collectionName: string;
  db?: mongodb.Db;
  session?: mongodb.ClientSession;

  constructor(options?: MongoServiceBase.Options)
  constructor(collectionName: string, options?: MongoServiceBase.Options)
  constructor(arg0: any, arg1?: any) {
    super();
    const options = typeof arg0 === 'object' ? arg0 : arg1;
    if (typeof arg0 === 'string')
      this._collectionName = arg0;
    this.db = options?.db;
  }

  forContext(
      context: RequestContext,
      options?: {
        newInstance?: boolean,
        db?: mongodb.Db,
        session?: mongodb.ClientSession
      }
  ): this {
    return super.forContext(context, {
      newInstance: options?.newInstance ||
          (options?.db && this.db !== options?.db) ||
          (options?.session && this.session !== options?.session)
    }) as this;
  }


  protected async _rawInsertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.insertOne(doc, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawCountDocuments(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: undefined,
      session: options?.session || this.session
    }
    try {
      return await collection.countDocuments(filter, options) || 0;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawDeleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.deleteOne(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawDeleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.deleteMany(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawFindOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T> | undefined> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.findOne<T>(filter, options) as PartialOutput<T>;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawFind(filter: mongodb.Filter<T>, options?: mongodb.FindOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return collection.find<T>(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawUpdateOne(filter: mongodb.Filter<T>, doc: UpdateFilter<T>, options?: mongodb.UpdateOptions) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      return await collection.updateOne(filter, doc, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  protected async _rawUpdateMany(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>
  ) {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session,
      upsert: false
    } as mongodb.UpdateOptions;
    try {
      return await collection.updateMany(filter, doc, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }


  protected async _onError(error: unknown): Promise<void> {
    if (this.onError)
      await this.onError(error);
  }

  protected getDatabase(): mongodb.Db | Promise<mongodb.Db> {
    if (!this.context)
      throw new Error(`Context not set!`);
    if (!this.db)
      throw new Error(`Database not set!`);
    return this.db;
  }

  protected async getCollection(db: mongodb.Db): Promise<mongodb.Collection<T>> {
    if (!this._collectionName)
      throw new Error('collectionName is not assigned');
    return db.collection<T>(this.getCollectionName());
  }

  protected getCollectionName(): string {
    if (!this._collectionName)
      throw new Error('collectionName is not defined');
    return this._collectionName;
  }

  protected onError?(error: unknown): void | Promise<void>;

  protected transformData?(row: PartialOutput<T>): PartialOutput<T>;

}
