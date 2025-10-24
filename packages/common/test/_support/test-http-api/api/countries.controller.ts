import { HttpController, HttpOperation } from '@opra/common';
import { Country } from 'example-customer-mongo/models';

@HttpController({
  description: 'Countries collection',
})
export class CountriesController {
  @HttpOperation.Entity.DeleteMany(Country)
  deleteMany() {
    //
  }

  @HttpOperation.Entity.FindMany(Country)
  findMany() {
    //
  }

  @HttpOperation.Entity.UpdateMany(Country)
  updateMany() {
    //
  }
}
