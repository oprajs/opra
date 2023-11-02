import mongodb, { UpdateFilter } from 'mongodb';
import { StrictOmit } from 'ts-gems';
import { ApiService, PartialOutput, RequestContext } from '@opra/core';

export namespace MongoEntityServiceBase {
  export interface Options {
    db?: mongodb.Db;
    defaultLimit?: number;
  }
}

export class MongoEntityServiceBase<T extends mongodb.Document> extends ApiService {
  protected _collectionName: string;
  defaultLimit: number;
  db?: mongodb.Db;
  session?: mongodb.ClientSession;

  constructor(options?: MongoEntityServiceBase.Options)
  constructor(collectionName: string, options?: MongoEntityServiceBase.Options)
  constructor(arg0, arg1?) {
    super();
    const options = typeof arg0 === 'object' ? arg0 : arg1;
    if (typeof arg0 === 'string')
      this._collectionName = arg0;
    this.db = options?.db;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  protected async _count(filter?: mongodb.Filter<T>, options?: mongodb.CountOptions): Promise<number> {
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

  protected async _deleteOne(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
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

  protected async _deleteMany(filter?: mongodb.Filter<T>, options?: mongodb.DeleteOptions): Promise<number> {
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

  protected async _findOne(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T> | undefined> {
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

  protected async _find(filter: mongodb.Filter<T>, options?: mongodb.FindOptions): Promise<PartialOutput<T>[]> {
    const db = await this.getDatabase();
    const collection = await this.getCollection(db);
    options = {
      ...options,
      limit: options?.limit || this.defaultLimit,
      session: options?.session || this.session
    }
    const out: any[] = [];
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

  protected async _insertOne(doc: mongodb.OptionalUnlessRequiredId<T>, options?: mongodb.InsertOneOptions): Promise<PartialOutput<T>> {
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
      throw new Error('"insertOne" endpoint returned no result!');
    return out;
  }

  protected async _updateOne(
      filter: mongodb.Filter<T>,
      doc: UpdateFilter<T> | Partial<T>,
      options?: mongodb.UpdateOptions
  ): Promise<PartialOutput<T> | undefined> {
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

  protected async _updateMany(
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

  forContext(
      context: RequestContext,
      db?: mongodb.Db,
      session?: mongodb.ClientSession
  ): typeof this {
    const instance = super.forContext(context) as typeof this;
    instance.db = db || this.db;
    instance.session = session || this.session;
    return instance as typeof this;
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
