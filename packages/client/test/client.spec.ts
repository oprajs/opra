import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { finalize, Observable } from 'rxjs';
import { ApiDocument } from '@opra/common';
import { createTestApi } from '../../core/test/_support/test-app/index.js';
import {
  FetchBackend,
  HttpCollectionNode, HttpEvent,
  HttpHandler,
  HttpSingletonNode,
  OpraHttpClient
} from '../src/index.js';

describe('OpraClient', function () {

  let api: ApiDocument;
  let client: OpraHttpClient;
  let server: http.Server;

  afterAll(() => server.close());

  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    api = await createTestApi();
    const app = express();
    app.use('*', (_req, _res) => {
      _res.json({});
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

  it('Should getMetadata() reject promise on error', async () => {
    const xClient = new OpraHttpClient('http://127.0.0.1:1001');
    await expect(() => xClient.getMetadata()).rejects.toThrow('Unable to fetch metadata');
  });

  it('Should "collection()" create a service for Collection resources', async () => {
    expect(client.collection('Customers')).toBeInstanceOf(HttpCollectionNode);
  });

  it('Should "singleton()" create a service for Singleton resources', async () => {
    expect(client.singleton('MyProfile')).toBeInstanceOf(HttpSingletonNode);
  });

  it('Should run interceptor chain', async () => {
    const address = server.address() as AddressInfo;
    const callStack: string[] = [];
    const client2 = new OpraHttpClient('http://127.0.0.1:' + address.port.toString(),
        {
          api,
          interceptors: [
            {
              intercept(request: FetchBackend.RequestInit, next: HttpHandler): Observable<HttpEvent> {
                callStack.push('a1');
                return next.handle(request)
                    .pipe(finalize(() => {
                      callStack.push('a2');
                    }));
              }
            },
            {
              intercept(request: FetchBackend.RequestInit, next: HttpHandler): Observable<HttpEvent> {
                callStack.push('b1');
                return next.handle(request)
                    .pipe(finalize(() => {
                      callStack.push('b2');
                    }));
              }
            }
          ]
        });
    await client2.collection('Customers')
        .get(1)
        .getResponse();
    expect(callStack).toEqual(['a1', 'b1', 'b2', 'a2']);
  });

  // it('Should check if Collection resource exists', async () => {
  //   await expect(
  //       () => client.collection('blabla').get(1).fetch()
  //   ).rejects.toThrow('not found');
  // });
  //
  // it('Should .collection() check if resource is CollectionResource', async () => {
  //   await expect(
  //       () => client.collection('MyProfile').get(1).fetch()
  //   ).rejects.toThrow('is not a Collection');
  // });
  //
  // it('Should check if Singleton resource exists', async () => {
  //   await expect(
  //       () => client.singleton('blabla').get().fetch()
  //   ).rejects.toThrow('not found');
  // });
  //
  // it('Should .singleton() check if resource is SingletonResource', async () => {
  //   await expect(
  //       () => client.singleton('Customers').get().fetch()
  //   ).rejects.toThrow('is not a Singleton');
  // });

});
