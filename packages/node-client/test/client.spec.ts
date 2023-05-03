import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { ApiDocument } from '@opra/common';
import { createTestApi } from '@opra/core/test/_support/test-app/index';
import { HttpCollectionNode, HttpSingletonNode, OpraHttpClient } from '../src/index.js';

describe('OpraClient', function () {

  let api: ApiDocument;
  let client: OpraHttpClient;
  let server: http.Server;

  afterAll(() => server.close());

  beforeAll(async () => {
    api = await createTestApi();
    const app = express();
    app.use('*', (_req, _res) => {
      _res.end({});
    });
    await new Promise<void>((subResolve) => {
      server = app.listen(0, '127.0.0.1', () => subResolve());
    }).then(async () => {
      const address = server.address() as AddressInfo;
      client = new OpraHttpClient('http://127.0.0.1:' + address.port.toString(), {api});
    });
  });

  it('Should retrieve metadata', async () => {
    expect(await client.getMetadata()).toBeInstanceOf(ApiDocument);
  });

  it('Should "collection()" create a service for Collection resources', async () => {
    expect(client.collection('Customers')).toBeInstanceOf(HttpCollectionNode);
  });

  it('Should "singleton()" create a service for Singleton resources', async () => {
    expect(client.singleton('MyProfile')).toBeInstanceOf(HttpSingletonNode);
  });

  it('Should check if Collection resource exists', async () => {
    await expect(
        () => client.collection('blabla').get(1).fetch()
    ).rejects.toThrow('not found');
  });

  it('Should .collection() check if resource is CollectionResource', async () => {
    await expect(
        () => client.collection('MyProfile').get(1).fetch()
    ).rejects.toThrow('is not a Collection');
  });

  it('Should check if Singleton resource exists', async () => {
    await expect(
        () => client.singleton('blabla').get().fetch()
    ).rejects.toThrow('not found');
  });

  it('Should .singleton() check if resource is SingletonResource', async () => {
    await expect(
        () => client.singleton('Customers').get().fetch()
    ).rejects.toThrow('is not a Singleton');
  });

});
