import express from 'express';
import { Db, MongoClient } from 'mongodb';
import { ApiDocument, DocumentFactory } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { CustomersResource } from './customers.resource.js';
import { MyProfileResource } from './my-profile.resource.js';

export interface TestApp {
  client: MongoClient,
  db: Db;
  document: ApiDocument;
  server: express.Express;
}

export async function createTestApp(): Promise<TestApp> {
  const client = new MongoClient('mongodb://localhost:27017');
  const db = client.db('opra_test');
  const document = await DocumentFactory.createDocument({
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
  const server = express();
  await OpraExpressAdapter.create(server, document);
  return {
    client,
    db,
    document,
    server
  }

}

