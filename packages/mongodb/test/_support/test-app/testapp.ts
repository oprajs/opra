import { Db, MongoClient } from 'mongodb';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import {
  ExecutionContextHost,
  HttpServerRequest,
  HttpServerResponse, NodeHttpAdapter,
  RequestContext,
  RequestHost,
  ResponseHost
} from '@opra/core';
import { CustomersResource } from './resources/customers.resource.js';
import { MyProfileResource } from './resources/my-profile.resource.js';

export class TestApp {
  adapter: NodeHttpAdapter;
  api: ApiDocument;
  dbClient: MongoClient;
  db: Db;

  static async create(): Promise<TestApp> {
    const out = new TestApp();
    out.api = await ApiDocumentFactory.createDocument({
      version: '1.0',
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      root: {
        resources: [
          new CustomersResource(out.db),
          new MyProfileResource(out.db),
        ]
      }
    })
    out.adapter = await NodeHttpAdapter.create(out.api);
    try {
      out.dbClient = new MongoClient('mongodb://localhost:27017');
      out.db = out.dbClient.db('opra_test');
    } catch (e) {
      await out.close();
      throw e;
    }
    return out;
  }

  protected constructor() {
  }

  async close() {
    await this.dbClient?.close();
    await this.adapter?.close();
  }

  async createContext() {
    const incoming = HttpServerRequest.from({method: 'GET', url: '/'});
    const outgoing = HttpServerResponse.from();
    const request = new RequestHost({
      http: incoming,
      endpoint: null,
      controller: {},
      handler: null
    } as any);
    const response = new ResponseHost({http: outgoing});
    const executionContext = new ExecutionContextHost(this.api, 'http', {http: {incoming, outgoing}});
    return RequestContext.from(executionContext, this.api, request, response);
  }

}
