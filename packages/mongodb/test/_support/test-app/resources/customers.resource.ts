import { Db } from 'mongodb';
import { Collection, ICollection, PartialOutput } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api/index';
import { CustomersService } from '../services/customers.service.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource implements ICollection<Customer> {
  service: CustomersService;

  constructor(readonly db: Db) {
    this.service = new CustomersService({db});
  }

  @Collection.Create()
  create(context: Collection.Create.Context): Promise<PartialOutput<Customer>> {
    const {request} = context;
    return this.service.forContext(context)
        .create(request.data, request.params);
  }

  @Collection.Get()
  get(context: Collection.Get.Context): Promise<PartialOutput<Customer> | undefined> {
    const {request} = context;
    return this.service.forContext(context)
        .get(request.key, request.params);
  }

  @Collection.FindMany()
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.countryCode')
      .DefaultSort('givenName')
      .Filter('_id')
      .Filter('givenName')
      .Filter('familyName')
      .Filter('gender')
      .Filter('uid')
      .Filter('address.countryCode')
      .Filter('deleted')
      .Filter('active')
      .Filter('birthDate')
      .Filter('rate')
  findMany(context: Collection.FindMany.Context): Promise<PartialOutput<Customer>[] | undefined> {
    const {request} = context;
    return this.service.forContext(context)
        .findMany(request.params);
  }


  @Collection.Delete()
  delete(context: Collection.Delete.Context): Promise<number> | undefined {
    const {request} = context;
    return this.service.forContext(context)
        .delete(request.key, request.params);
  }

  @Collection.DeleteMany()
  deleteMany(context: Collection.DeleteMany.Context): Promise<number> | undefined {
    const {request} = context;
    return this.service.forContext(context)
        .deleteMany(request.params);
  }

  @Collection.Update()
  update(context: Collection.Update.Context): Promise<PartialOutput<Customer> | undefined> {
    const {request} = context;
    return this.service.forContext(context)
        .update(request.key, request.data, request.params);
  }

  @Collection.UpdateMany()
  updateMany(context: Collection.UpdateMany.Context): Promise<number> | undefined {
    const {request} = context;
    return this.service.forContext(context)
        .updateMany(request.data, request.params);
  }

}
