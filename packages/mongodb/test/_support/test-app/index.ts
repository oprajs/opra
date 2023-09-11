import { Db, MongoClient } from 'mongodb';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { CustomersResource } from './customers.resource.js';
import { MyProfileResource } from './my-profile.resource.js';

export interface TestApp {
  client: MongoClient,
  db: Db;
  document: ApiDocument;
  adapter: HttpAdapter;
}

export async function createTestApp(): Promise<TestApp> {
  const client = new MongoClient('mongodb://localhost:27017');
  const db = client.db('opra_test');
  const document = await ApiDocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    resources: [
      new CustomersResource(db),
      new MyProfileResource(db),
    ]
  })
  const adapter = await HttpAdapter.create(document);
  return {
    client,
    db,
    document,
    adapter
  }

}

