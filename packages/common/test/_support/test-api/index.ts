import { CustomerModelsDocument } from 'customer-mongo/models';
import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { AuthController } from './api/auth.controller.js';
import { CountriesController } from './api/countries.controller.js';
import { CountryController } from './api/country.controller.js';
import { CustomerController } from './api/customer.controller.js';
import { CustomersController } from './api/customers.controller.js';

export namespace TestApiDocument {
  export async function create() {
    const customerDoc = await CustomerModelsDocument.init();
    return ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestDocument',
        version: 'v1',
        description: 'Document description',
      },
      references: {
        ns1: customerDoc,
      },
      api: {
        protocol: 'http',
        name: 'TestService',
        description: 'test service',
        url: '/test',
        controllers: [AuthController, CountriesController, CountryController, CustomersController, CustomerController],
      },
    });
  }
}
