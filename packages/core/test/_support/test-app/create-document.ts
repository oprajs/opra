import { DocumentFactory } from '@opra/common';
import { BestCustomerResource } from './resource/best-customer.resource.js';
import { CustomersResource } from './resource/customers.resource.js';

export async function createTestDocument() {
  return DocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    resources: [CustomersResource, BestCustomerResource]
  });
}
