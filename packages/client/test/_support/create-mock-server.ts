import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { ApiDocument } from '@opra/common';
import { createTestApi } from '../../../core/test/_support/test-app/index.js';

export interface MockServer extends express.Express {
  server: http.Server;
  address: string;
  port: number;
  baseUrl: string;
  api: ApiDocument;
  lastRequest: express.Request;
  lastResponse: express.Response;

  mockHandler(fn: (req: express.Request, res: express.Response) => void): void;
}

export async function createMockServer(): Promise<MockServer> {
  let server: http.Server;
  const api = await createTestApi();
  const app = express() as MockServer;
  app.use(bodyParser.json());
  let mockHandler: Function | undefined;
  app.use('*', (_req, _res) => {
    app.lastRequest = _req;
    app.lastResponse = _res;
    if (mockHandler)
      mockHandler(_req, _res);
    _res.end();
  });

  return await new Promise<void>((subResolve) => {
    server = app.listen(0, '127.0.0.1', () => subResolve());
  }).then(async () => {
    const address = server.address() as AddressInfo;
    app.server = server;
    app.address = address.address;
    app.port = address.port;
    app.baseUrl = `http://${address.address}:${address.port}`;
    app.api = api;
    // app.client = new OpraHttpClient(app.baseUrl, {api});
    app.mockHandler = (fn: Function) => {
      mockHandler = fn;
    }
    return app;
  });
}
