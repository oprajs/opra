import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { ApiDocument } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import { createTestApi } from '../../../core/test/_support/test-app/index.js';

export interface MockServer extends express.Express {
  api: ApiDocument;
  adapter: ExpressAdapter,
  server: http.Server,
  address: string;
  port: number;
  baseUrl: string;
  lastRequest: express.Request;
  lastResponse: express.Response;
}

export async function createMockServer(): Promise<MockServer> {

  const api = await createTestApi();
  const app = express() as MockServer;
  app.use(bodyParser.json());
  app.use('*', (_req, _res, next) => {
    app.lastRequest = _req;
    app.lastResponse = _res;
    next();
  });
  app.adapter = await ExpressAdapter.create(app, api);

  return await new Promise<void>((subResolve) => {
    app.server = app.listen(0, '127.0.0.1', () => subResolve());
  }).then(async () => {
    const address = app.server.address() as AddressInfo;
    app.address = address.address;
    app.port = address.port;
    app.baseUrl = `http://${address.address}:${address.port}`;
    return app;
  });
}
