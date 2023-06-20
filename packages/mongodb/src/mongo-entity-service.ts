import mongodb, { UpdateFilter } from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { PartialOutput, RequestContext } from '@opra/core';

export namespace MongoEntityService {
  export interface Options {
    db?: mongodb.Db;
    defaultLimit?: number;
  }
}

export class MongoEntityService<T extends mongodb.Document, TOutput = PartialOutput<T>> {
  protected _collectionName: string;
  context: RequestContext;
  defaultLimit: number;
  db?: mongodb.Db;
  session?: mongodb.ClientSession;

  constructor(options?: MongoEntityService.Options)
  constructor(collectionName: string, options?: MongoEntityService.Options)
  constructor(arg0, arg1?) {
    const options = typeof arg0 === 'object' ? arg0 : arg1;
    if (typeof arg0 === 'string')
      this._collectionName = arg0;
    this.db = options?.db;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  async count(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: undefined,
      session: options?.session || this.session
    }
    try {
      return await collection.count(filter, options) || 0;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async deleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      const r = await collection.deleteOne(filter, options);
      return r.deletedCount;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async deleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      const r = await collection.deleteMany(filter, options);
      return r.deletedCount;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  async findOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<TOutput | undefined> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session
    }
    let out;
    try {
      out = await collection.findOne<T>(filter, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    return out;
  }

  async find(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<TOutput[]> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: options?.limit || this.defaultLimit,
      session: options?.session || this.session
    }
    const out: TOutput[] = [];
    let cursor: mongodb.FindCursor<T> | undefined;
    try {
      cursor = collection.find<T>(filter, options);
      let obj;
      while (out.length < this.defaultLimit && (obj = await cursor.next())) {
        const v = this.transformData ? this.transformData(obj) : obj;
        if (v)
          out.push(obj);
      }
    } catch (e: any) {
      await this._onError(e);
      throw e;
    } finally {
      if (cursor)
        await cursor.close();
    }
    return out;
  }

  async insertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions): Promise<TOutput> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    let out;
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      const r = await collection.insertOne(doc, options);
      if (r.insertedId)
        out = await collection.findOne({_id: r.insertedId as any}, options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (this.transformData)
      out = this.transformData(out);
    if (!out)
      throw new Error('"insertOne" operation returned no result!');
    return out;
  }

  async updateOne(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: mongodb.UpdateOptions
  ): Promise<TOutput | undefined> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    let out;
    options = {
      ...options,
      session: options?.session || this.session
    }
    try {
      const r = await collection.updateOne(filter, doc, options);
      if (r.matchedCount)
        out = await collection.findOne((r.upsertedId ? {_id: r.upsertedId as any} : filter), options);
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
    if (this.transformData)
      out = this.transformData(out);
    return out;
  }

  async updateMany(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: StrictOmit<mongodb.UpdateOptions, 'upsert'>
  ): Promise<number> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      session: options?.session || this.session,
      upsert: false
    } as mongodb.UpdateOptions;
    try {
      const r = await collection.updateMany(filter, doc, options);
      return r.matchedCount;
    } catch (e: any) {
      await this._onError(e);
      throw e;
    }
  }

  with(
      context: RequestContext,
      db?: mongodb.Db,
      session?: mongodb.ClientSession
  ): MongoEntityService<T, TOutput> {
    if (this.context === context && this.db === db && this.session === session)
      return this;
    const instance = {context} as MongoEntityService<T, TOutput>;
    // Should reset session if db changed
    if (db) {
      instance.db = db;
      instance.session = session;
    }
    if (session)
      instance.session = session;
    Object.setPrototypeOf(instance, this);
    return instance;
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

  protected transformData?(row: TOutput): TOutput;

}
