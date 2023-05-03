import '@opra/core';
import { Collection } from '@opra/common';
import { Country } from '@opra/common/test/_support/test-api';

@Collection(Country, {
  description: 'Country resource',
  primaryKey: 'code'
})
export class CountriesResource {
  public initialized = false;
  public closed = false;

  @Collection.Create()
  create() {
    return new Country();
  }

  @Collection.Get()
  get() {
    return new Country();
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
    return new Country();
  }

  @Collection.UpdateMany()
  updateMany() {
    return 1;
  }

  @Collection.FindMany()
  search() {
    return [new Country()];
  }

  @Collection.OnInit()
  onInit() {
    this.initialized = true;
  }

  @Collection.OnShutdown()
  onShutdown() {
    this.closed = true;
  }

}
