import { HttpController, HttpOperation, OmitType, OperationResult } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { CustomerNotesService, Note } from 'customer-mongo';
import { Db } from 'mongodb';
import { PartialDTO } from 'ts-gems';

@HttpController({
  path: 'Notes',
  name: 'Notes',
})
export class CustomerNotesController {
  service: CustomerNotesService;

  constructor(readonly db: Db) {
    this.service = new CustomerNotesService({ db });
  }

  @(HttpOperation.Entity.Get(Note).KeyParam('_id', Number))
  async get(context: HttpOperation.Context): Promise<PartialDTO<Note> | undefined> {
    const { key, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).findById(context.pathParams.customerId, key, options);
  }

  @(HttpOperation.Entity.Delete(Note).KeyParam('_id', Number))
  async delete(context: HttpOperation.Context) {
    const { key, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).delete(context.pathParams.customerId, key, options);
  }

  @(HttpOperation.Entity.Update(Note).KeyParam('_id', Number))
  async update(context: HttpOperation.Context) {
    const { key, data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).update(context.pathParams.customerId, key, data, options);
  }

  @HttpOperation.Entity.Create(Note, {
    requestBody: {
      type: OmitType(Note, ['_id']),
    },
  })
  async create(context: HttpOperation.Context): Promise<PartialDTO<Note>> {
    const { data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).create(context.pathParams.customerId, data, options);
  }

  @(HttpOperation.Entity.FindMany(Note)
    .SortFields('_id', 'title', 'title')
    .DefaultSort('_id')
    .Filter('_id')
    .Filter('title')
    .Filter('text')
    .Filter('rank'))
  async findMany(context: HttpOperation.Context) {
    const { options } = await MongoAdapter.parseRequest(context);
    if (options.count) {
      const { items, count } = await this.service.for(context).findManyWithCount(options);
      return new OperationResult({
        payload: items,
        totalMatches: count,
      });
    }
    return this.service.for(context).findMany(context.pathParams.customerId, options);
  }

  @(HttpOperation.Entity.DeleteMany(Note).Filter('_id').Filter('rank'))
  async deleteMany(context: HttpOperation.Context) {
    const { options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).deleteMany(context.pathParams.customerId, options);
  }

  @(HttpOperation.Entity.UpdateMany(Note).Filter('_id').Filter('rank'))
  async updateMany(context: HttpOperation.Context) {
    const { data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).updateMany(context.pathParams.customerId, data, options);
  }
}
