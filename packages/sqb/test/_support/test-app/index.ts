import '@sqb/postgres';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { CustomersResource } from './resources/customers.resource.js';
import { MyProfileResource } from './resources/my-profile.resource.js';

export interface TestApp {
  db: SqbClient;
  api: ApiDocument;
  adapter: NodeHttpAdapter
}

export async function createTestApp(): Promise<TestApp> {
  const db = new SqbClient({
    dialect: 'postgres',
    schema: 'opra_test'
  })
  const api = await ApiDocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    root: {
      resources: [
        new CustomersResource(db),
        new MyProfileResource(db)
      ]
    }
  })
  const adapter = await NodeHttpAdapter.create(api);
  return {
    db,
    api,
    adapter
  }

}

