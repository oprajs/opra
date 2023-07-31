import '@sqb/postgres';
import { ApiDocument, DocumentFactory } from '@opra/common';
import { OpraHttpAdapter } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { CustomersResource } from './customers.resource.js';
import { MyProfileResource } from './my-profile.resource.js';

export interface TestApp {
  db: SqbClient;
  document: ApiDocument;
  adapter: OpraHttpAdapter
}

export async function createTestApp(): Promise<TestApp> {
  const db = new SqbClient({
    dialect: 'postgres',
    schema: 'opra_test'
  })
  const document = await DocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    resources: [
      new CustomersResource(db),
      new MyProfileResource(db)
    ]
  })
  const adapter = await OpraHttpAdapter.create(document);
  return {
    db,
    document,
    adapter
  }

}

