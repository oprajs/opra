import mongodb from 'mongodb';
import { PartialInput } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { MongoCollectionService } from '@opra/mongodb';

export class CustomersService extends MongoCollectionService<Customer> {

  constructor(options?: MongoCollectionService.Options) {
    super(Customer, {
      collectionName: 'Customers',
      ...options,
    });
  }

  async create(doc: mongodb.OptionalUnlessRequiredId<Customer>, options?: MongoCollectionService.CreateOptions) {
    return super.create(doc, options);
  }

  async findById(id: any, options?: MongoCollectionService.FindOneOptions) {
    return super.findById(id, options);
  }

  async delete(id: any, options?: MongoCollectionService.DeleteOptions<Customer>) {
    return super.delete(id, options);
  }

  async deleteMany(options?: MongoCollectionService.DeleteManyOptions<Customer>) {
    return super.deleteMany(options);
  }

  async findMany(options?: MongoCollectionService.FindManyOptions<Customer>) {
    return super.findMany(options);
  }

  async findOne(options?: MongoCollectionService.FindOneOptions) {
    return super.findOne(options);
  }

  async update(id: any, doc: PartialInput<Customer>,
               options?: MongoCollectionService.UpdateOptions<Customer>
  ) {
    return super.update(id, doc, options);
  }

  async updateMany(doc: PartialInput<Customer>, options?: MongoCollectionService.UpdateManyOptions<Customer>) {
    return super.updateMany(doc, options);
  }

}
