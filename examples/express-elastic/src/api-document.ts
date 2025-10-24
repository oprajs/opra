import { Client } from '@elastic/elasticsearch';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { CustomerModelsDocument } from 'example-customer-elastic';
import { AuthController } from './api/auth.controller.js';

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
        transport: 'http',
        controllers: [new AuthController(client)],
      },
    });
  }
}
