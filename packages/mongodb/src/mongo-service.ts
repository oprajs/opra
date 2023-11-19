import mongodb, { UpdateFilter } from 'mongodb';
import { StrictOmit, Type } from 'ts-gems';
import { ComplexType, DATATYPE_METADATA } from '@opra/common';
import { ApiService, PartialOutput, RequestContext } from '@opra/core';

export namespace MongoService {
  export interface Options {
    db?: mongodb.Db;
    collectionName?: string;
    resourceName?: string;
  }
}

export class MongoService<T extends mongodb.Document> extends ApiService {
  protected _dataType: Type | string;
  collectionName?: string;
  db?: mongodb.Db;
  session?: mongodb.ClientSession;
  resourceName?: string;

  constructor(dataType: Type | string, options?: MongoService.Options) {
    super();
    this._dataType = dataType;
    this.collectionName = options?.collectionName;
    this.db = options?.db;
    if (!this.collectionName) {
      if (typeof dataType === 'string')
        this.collectionName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata)
          this.collectionName = metadata.name;
      }
    }
    this.resourceName = options?.resourceName || this.collectionName;
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

  protected getDataType(): ComplexType {
    return this.context.api.getComplexType(this._dataType);
  }

  protected async getCollection(db: mongodb.Db): Promise<mongodb.Collection<T>> {
    return db.collection<T>(this.getCollectionName());
  }

  protected getCollectionName(): string {
    if (this.collectionName)
      return this.collectionName;
    throw new Error('collectionName is not defined');
  }

  protected onError?(error: unknown): void | Promise<void>;

  protected transformData?(row: PartialOutput<T>): PartialOutput<T>;

}
