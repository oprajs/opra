// import assert from 'assert';
// import { ICollectionResource, RequestContext } from '@opra/core';
// import { MongoAdapter } from './mongo-adapter.js';
// import { MongoCollectionService } from './mongo-collection-service.js';
//
// export abstract class BaseEntityResource<T> implements ICollectionResource<T> {
//
//   async create(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     assert.strictEqual(prepared.method, 'create');
//     return (await this.getService(ctx)).create(prepared.values, prepared.options, ctx.userContext);
//   }
//
//   async count(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).count(prepared.options, ctx.userContext);
//   }
//
//   async delete(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).delete(prepared.keyValue, prepared.options, ctx.userContext);
//   }
//
//   async deleteMany(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).deleteMany(prepared.options, ctx.userContext);
//   }
//
//   async get(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).get(prepared.keyValue, prepared.options, ctx.userContext);
//   }
//
//   async search(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).search(prepared.options, ctx.userContext);
//   }
//
//   async update(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).update(prepared.keyValue, prepared.values, prepared.options, ctx.userContext);
//   }
//
//   async updateMany(ctx: RequestContext) {
//     const prepared = MongoAdapter.prepare(ctx.query);
//     return (await this.getService(ctx)).updateMany(prepared.values, prepared.options, ctx.userContext);
//   }
//
//   abstract getService(ctx: RequestContext): MongoCollectionService<T> | Promise<MongoCollectionService<T>>;
// }
