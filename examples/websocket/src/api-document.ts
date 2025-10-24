import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { CustomerModelsDocument } from 'example-customer-mongo';

export namespace CustomerApiDocument {
  export async function create(): Promise<ApiDocument> {
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
        transport: 'ws',
        controllers: [
          // new AuthController(db),
          // new CustomerController(db),
          // new CustomersController(db),
        ],
      },
    });
  }
}
