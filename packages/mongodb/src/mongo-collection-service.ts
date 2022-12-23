// import { isPlainObject } from 'lodash';
// import mongodb, {
//   Db,
//   Filter,
//   InsertOneOptions,
//   ModifyResult,
//   OptionalUnlessRequiredId,
//   UpdateFilter,
// } from 'mongodb';
// import { Maybe, StrictOmit } from 'ts-gems';
// import { PartialOutput } from '@opra/core';
// import { BadRequestError } from '@opra/exception';
// import { CollectionResourceInfo } from '@opra/common';
//
// export namespace MongoCollectionService {
//   export type CountOptions<TSchema> = mongodb.CountOptions & { filter?: Filter<TSchema> };
//   export type CreateOptions = InsertOneOptions & { reloadDocument?: boolean };
//   export type DeleteOptions = mongodb.DeleteOptions;
//   export type DeleteManyOptions<TSchema> = mongodb.DeleteOptions & { filter?: Filter<TSchema> };
//   export type GetOptions = mongodb.FindOptions;
//   export type SearchOptions<TSchema> = mongodb.FindOptions & { filter?: Filter<TSchema> };
//   export type UpdateOptions = StrictOmit<mongodb.FindOneAndUpdateOptions, 'returnDocument'>;
//   export type UpdateManyOptions<TSchema> = mongodb.UpdateOptions & { filter?: Filter<TSchema> };
// }
//
// export abstract class MongoCollectionService<TSchema, TOutput = PartialOutput<TSchema>> {
//   // protected _metadata: EntityMetadata;
//   protected _collectionName: string;
//   protected _maxLimit: number;
//
//   protected constructor(readonly resource: CollectionResourceInfo, options?: {
//     collectionName: string;
//     maxLimit?: number;
//   }) {
//     this._collectionName = options?.collectionName || resource.name;
//     this._maxLimit = options?.maxLimit || 1000;
//     // const metadata = EntityMetadata.get(resourceType);
//     // if (!metadata)
//     //   throw new TypeError(`You must provide an SQB entity class`);
//     // this._metadata = metadata;
//   }
//
//   get maxLimit(): number {
//     return this._maxLimit;
//   }
//
//   set maxLimit(value: number) {
//     this._maxLimit = value;
//   }
//
//   async create(
//       data: OptionalUnlessRequiredId<TSchema>,
//       options: MongoCollectionService.CreateOptions = {},
//       userContext?: any
//   ): Promise<TOutput> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     let out;
//     try {
//       const result = await collection.insertOne(data, {...options});
//       if (options.reloadDocument)
//         out = await collection.findOne({_id: result.insertedId}) as TSchema;
//       else if (data._id !== result.insertedId) {
//         out = {_id: null, ...data};
//         out._id = result.insertedId;
//       }
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//     if (out && this.onTransformRow)
//       out = this.onTransformRow(out, userContext, 'create');
//     return out;
//   }
//
//   async count(
//       options: MongoCollectionService.CountOptions<TSchema> = {},
//       userContext?: any
//   ): Promise<number> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     try {
//       const filter = options?.filter || {};
//       return await collection.count(filter, options);
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//   }
//
//   async delete(
//       keyValue: any,
//       options: MongoCollectionService.DeleteOptions = {},
//       userContext?: any
//   ): Promise<boolean> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     try {
//       const filter = isPlainObject(keyValue) ? keyValue : {_id: keyValue};
//       const result = await collection.deleteOne(filter, options);
//       return !!result.deletedCount;
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//   }
//
//   async deleteMany(
//       options: MongoCollectionService.DeleteManyOptions<TSchema> = {},
//       userContext?: any
//   ): Promise<number> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     try {
//       const filter = options?.filter || {};
//       const result = await collection.deleteMany(filter, options);
//       return result.deletedCount;
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//   }
//
//   async get(
//       keyValue: any,
//       options: MongoCollectionService.GetOptions = {},
//       userContext?: any
//   ): Promise<Maybe<TOutput>> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     let out;
//     try {
//       const filter = isPlainObject(keyValue) ? keyValue : {_id: keyValue};
//       out = await collection.findOne(filter, options);
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//     if (out && this.onTransformRow)
//       out = this.onTransformRow(out, userContext, 'get');
//     return out;
//   }
//
//   async search(
//       options: MongoCollectionService.SearchOptions<TSchema> = {},
//       userContext?: any
//   ): Promise<TOutput[]> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     let items: any[];
//     try {
//       const filter = options?.filter || {};
//       items = await collection.find(filter, {
//         ...options,
//         limit: Math.min(options.limit || 10, this.maxLimit)
//       }).toArray();
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//
//     if (items.length && this.onTransformRow) {
//       const newItems: any[] = [];
//       for (const item of items) {
//         const v = this.onTransformRow(item, userContext, 'search');
//         if (v)
//           newItems.push(v);
//       }
//       return newItems;
//     }
//     return items;
//   }
//
//   async update(
//       keyValue: any,
//       data: UpdateFilter<TSchema>,
//       options: MongoCollectionService.UpdateOptions = {},
//       userContext?: any
//   ): Promise<Maybe<TOutput>> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     let out;
//     try {
//       const filter = isPlainObject(keyValue) ? keyValue : {_id: keyValue};
//       const result: ModifyResult = await collection.findOneAndUpdate(filter, data as any, {
//         ...options,
//         returnDocument: 'after'
//       });
//       out = result.value;
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//     if (out && this.onTransformRow)
//       out = this.onTransformRow(out, userContext, 'update');
//     return out;
//   }
//
//   async updateMany(
//       data: UpdateFilter<TSchema>,
//       options: MongoCollectionService.UpdateManyOptions<TSchema> = {},
//       userContext?: any
//   ): Promise<number> {
//     const db = await this.getDatabase(userContext);
//     const collection = db.collection(this._collectionName);
//     try {
//       const result = await collection.updateMany(data, options);
//       return (result.modifiedCount || 0) + (result.upsertedCount || 0);
//     } catch (e: any) {
//       await this._onError(e);
//       throw new BadRequestError(e);
//     }
//   }
//
//   private async _onError(e: unknown): Promise<void> {
//     if (this.onError)
//       await this.onError(e);
//   }
//
//   protected abstract getDatabase(userContext?: any): Db | Promise<Db>;
//
//   protected onError?(e: unknown): void | Promise<void>;
//
//   protected onTransformRow?(row: TOutput, userContext: any, method: string): TOutput;
//
// }
