import '@opra/core';
import merge from 'putil-merge';
import { Collection, CollectionResource } from '@opra/common';
import { customersData } from '../../../../../../support/test/customers.data.js';
import { Customer } from '../entities/customer.entity.js';

let customers: Customer[] = JSON.parse(JSON.stringify(customersData));

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: '_id'
})
export class CustomersResource implements CollectionResource<Customer> {
  public initialized = false;
  public closed = false;
  public idGen = 0;

  @Collection.Create()
  async create(context: Collection.Create.Context) {
    const customer: Customer = {_id: ++this.idGen, ...context.request.data};
    customers.push(customer);
    return customer;
  }

  @Collection.Get()
  async get(context: Collection.Get.Context) {
    return customers.find(x => x._id === context.request.key);
  }

  @Collection.Delete()
  async delete(context: Collection.Delete.Context) {
    const oldLen = customers.length;
    customers = customers.filter(x => x._id !== context.request.key);
    return oldLen - customers.length;
  }

  @Collection.DeleteMany()
  async deleteMany() {
    // It is hard to produce a filtering operation. We delete 10 records instead of this
    const oldLen = customers.length;
    customers = customers.slice(0, oldLen - 10);
    return oldLen - customers.length;
  }

  @Collection.Update()
  async update(context: Collection.Update.Context) {
    const customer = customers.find(x => x._id === context.request.key);
    if (customer)
      merge(customer, context.request.data);
    return customer;
  }

  @Collection.UpdateMany()
  async updateMany(context: Collection.UpdateMany.Context) {
    // It is hard to produce a filtering operation. We update 5 records instead of this
    for (let i = customers.length - 5; i < customers.length; i++) {
      merge(customers[i], context.request.data);
    }
    return 5;
  }

  @Collection.FindMany({
    sortFields: ['_id', 'givenName', 'familyName', 'gender', 'address.countryCode'],
    defaultSort: ['givenName'],
    filters: [
      {field: '_id', operators: ['=', '>', '<', '>=', '<=']},
      {field: 'givenName', operators: ['=', 'like', '!like']},
      {field: 'familyName', operators: ['=', 'like', '!like']},
      {field: 'gender', operators: ['=']},
      {field: 'address.countryCode', operators: ['=']}
    ]
  })
  async findMany() {
    return customers;
  }

  @Collection.OnInit()
  async onInit() {
    this.initialized = true;
  }

  @Collection.OnShutdown()
  async onShutdown() {
    this.closed = true;
  }

}
