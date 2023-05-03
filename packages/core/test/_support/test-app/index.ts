import { DocumentFactory } from '@opra/common';
import { CountriesResource } from './resource/countries.resource.js';
import { CustomersResource } from './resource/customers.resource.js';
import { MyProfileResource } from './resource/my-profile.resource.js';
import { ProductsResource } from './resource/products.resource.js';

export * from '@opra/common/test/_support/test-api';
export * from './resource/customers.resource.js';
export * from './resource/products.resource.js';
export * from './resource/my-profile.resource.js';

export async function createTestApi() {
  return DocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    resources: [
      CustomersResource,
      MyProfileResource,
      CountriesResource,
      ProductsResource
    ]
  });
}
