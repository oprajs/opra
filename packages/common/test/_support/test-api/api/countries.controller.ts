import { Country } from 'customer-mongo/models';
import { HttpController, HttpOperation } from '@opra/common';

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
