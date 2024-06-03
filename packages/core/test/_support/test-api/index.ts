import { ApiDocumentFactory } from '@opra/common';
import {
  Address,
  Country,
  Customer,
  GenderEnum,
  Note,
  Person,
  Profile,
  Record,
} from '../../../../common/test/_support/test-api/index.js';
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
  return ApiDocumentFactory.createDocument({
    spec: '1.0',
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    types: [Address, Note, Person, Record, GenderEnum, Country, Customer, Profile],
    api: {
      protocol: 'http',
      name: 'TestApi',
      root: RootController,
    },
  });
}
