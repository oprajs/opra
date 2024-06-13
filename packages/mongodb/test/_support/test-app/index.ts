import express from 'express';
import { Db, MongoClient } from 'mongodb';
import { ApiDocument, ApiDocumentFactory, HttpOperation } from '@opra/common';
import { ExpressAdapter, HttpContext, HttpIncoming, HttpOutgoing } from '@opra/core';
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
import { CustomersController } from './api/customers-controller.js';
import { MyProfileController } from './api/my-profile.controller.js';

export class TestApp {
  adapter: ExpressAdapter;
  document: ApiDocument;
  dbClient: MongoClient;
  db: Db;

  static async create(): Promise<TestApp> {
    const out = new TestApp();
    try {
      out.dbClient = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true');
      out.db = out.dbClient.db('opra_test');
    } catch (e) {
      await out.close();
      throw e;
    }
    out.document = await ApiDocumentFactory.createDocument({
      info: {
        title: 'TestApi',
        version: '1.0',
      },
      types: [Customer, Profile, Record, Person, Address, Note, Country, GenderEnum],
      api: {
        name: 'TestApi',
        protocol: 'http',
        controllers: [new CustomersController(out.db), new MyProfileController(out.db)],
      },
    });
    const app = express();
    out.adapter = new ExpressAdapter(app, out.document);
    return out;
  }

  protected constructor() {}

  async close() {
    await this.dbClient?.close();
    await this.adapter?.close();
  }

  createContext(operation?: HttpOperation) {
    const request = HttpIncoming.from({ method: 'GET', url: '/' });
    const response = HttpOutgoing.from({ req: request });
    return new HttpContext({
      adapter: this.adapter,
      operation,
      controller: operation?.owner,
      platform: 'express',
      platformArgs: {},
      request,
      response,
    });
  }
}
