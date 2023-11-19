import { Db, MongoClient } from 'mongodb';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { CustomersResource } from './resources/customers.resource.js';
import { MyProfileResource } from './resources/my-profile.resource.js';

export interface TestApp {
  client: MongoClient,
  db: Db;
  api: ApiDocument;
  adapter: NodeHttpAdapter;
}

export async function createTestApp(): Promise<TestApp> {
  const client = new MongoClient('mongodb://localhost:27017');
  const db = client.db('opra_test');
  const api = await ApiDocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    root: {
      resources: [
        new CustomersResource(db),
        new MyProfileResource(db),
      ]
    }
  })
  const adapter = await NodeHttpAdapter.create(api);
  return {
    client,
    db,
    api,
    adapter
  }

}

