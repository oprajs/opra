import '@opra/core';
import { Collection } from '@opra/common';
import { Product } from '@opra/common/test/_support/test-api';

@Collection(Product, {
  description: 'Products resource',
  primaryKey: '_id'
})
export class ProductsResource {

  @Collection.Create()
  create() {
    return new Product();
  }

  @Collection.Get()
  get() {
    return new Product();
  }

  @Collection.Delete()
  delete() {
    return true;
  }

  @Collection.DeleteMany()
  deleteMany() {
    return 1;
  }

  @Collection.Update()
  update() {
    return new Product();
  }

  @Collection.UpdateMany()
  updateMany() {
    return 1;
  }

  @Collection.FindMany()
  search() {
    return [new Product()];
  }

}
