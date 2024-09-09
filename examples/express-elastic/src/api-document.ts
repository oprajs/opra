import { Client } from '@elastic/elasticsearch';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { CustomerModelsDocument } from 'customer-elastic';
import { AuthController } from './api/auth.controller.js';
// import { CustomerController } from './api/customer.controller.js';
// import { CustomersController } from './api/customers-controller.js';

export namespace CustomerApiDocument {
  export async function create(client: Client): Promise<ApiDocument> {
    return ApiDocumentFactory.createDocument({
      info: {
        title: 'Customer Application',
        version: '1.0',
      },
      references: {
        cm: () => CustomerModelsDocument.create(),
      },
      api: {
        name: 'CustomerApi',
        protocol: 'http',
        controllers: [
          new AuthController(client),
          // new CustomerController(client), new CustomersController(client)
        ],
      },
    });
  }
}
