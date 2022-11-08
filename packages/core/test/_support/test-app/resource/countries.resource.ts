import {
  CollectionResourceInfo,
  OprCollectionResource,
  OprDeleteResolver,
  OprSearchResolver,
  ResourceInfo
} from '@opra/schema';
import { JsonCollectionService, QueryContext } from '../../../../src/index.js';
import { ICollectionResource } from '../../../../src/interfaces/resource.interface.js';
import countriesData from '../data/countries.data.js';
import { Country } from '../entities/country.entity.js';


@OprCollectionResource(Country, {
  description: 'Countries resource',
  keyFields: 'code'
})
export class CountriesResource implements ICollectionResource<Country> {

  service: JsonCollectionService<Country>;

  @OprSearchResolver({
    sortFields: ['code', 'name'],
    defaultSort: ['name'],
    filters: [
      {field: 'code', operators: ['=']},
      {field: 'name', operators: ['=', 'like', '!like']}
    ]
  })
  search;

  @OprDeleteResolver()
  delete;

  init(resource: ResourceInfo) {
    this.service = new JsonCollectionService<Country>(resource as CollectionResourceInfo,
        {resourceName: 'Countries', data: countriesData});
  }

  get(ctx: QueryContext, keyValue, options: any) {
    return this.service.get(keyValue, options);
  }

}
