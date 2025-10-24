import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { SqbClient } from '@sqb/connect';
import { CustomerModelsDocument } from 'example-customer-sqb';
import { AuthController } from './api/auth.controller.js';
import { CustomerController } from './api/customer-controller.js';
import { CustomersController } from './api/customers-controller.js';

export namespace CustomerApiDocument {
  export async function create(db: SqbClient): Promise<ApiDocument> {
    return ApiDocumentFactory.createDocument({
      info: {
        title: 'Customer Application',
        version: '1.0',
      },
      references: {
        cm: await CustomerModelsDocument.create(),
      },
      api: {
        name: 'CustomerApi',
        transport: 'http',
        controllers: [
          new AuthController(db),
          new CustomerController(db),
          new CustomersController(db),
        ],
      },
    });
  }
}
