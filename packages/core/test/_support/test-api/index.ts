import { CustomerModelsDocument } from 'customer-mongo/models';
import { ApiDocumentFactory } from '@opra/common';
import { AuthController } from './api/auth.controller.js';
import { CustomerController } from './api/customer.controller.js';
import { CustomersController } from './api/customers.controller.js';
import { FilesController } from './api/files.controller.js';
import { MyProfileController } from './api/my-profile.controller.js';
import { RootController } from './api/root.controller.js';

export * from './api/auth.controller.js';
export * from './api/customer.controller.js';
export * from './api/customer-address.controller.js';
export * from './api/customer-addresses.controller.js';
export * from './api/customers.controller.js';
export * from './api/files.controller.js';
export * from './api/my-profile.controller.js';
export * from './api/root.controller.js';

export async function createTestApi() {
  const customerDoc = await CustomerModelsDocument.init();
  return ApiDocumentFactory.createDocument({
    spec: '1.0',
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    references: {
      customer: customerDoc,
    },
    api: {
      protocol: 'http',
      name: 'TestApi',
      controllers: [
        RootController,
        AuthController,
        CustomersController,
        CustomerController,
        FilesController,
        MyProfileController,
      ],
    },
  });
}
