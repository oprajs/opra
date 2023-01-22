import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { createTestDocument } from '../../../core/test/_support/test-app/create-document.js';
import { OpraHttpClient } from '../../src/index.js';

export async function createMockServer() {
  let server: http.Server;
  const document = await createTestDocument();
  const app: any = express();
  app.use(bodyParser.json());
  app.use('*', (_req, _res) => {
    app.lastRequest = _req;
    app.respBody = {id: 1};
    _res.header('Content-Type', 'application/json');
    _res.end(JSON.stringify(app.respBody));
  });

  return await new Promise<void>((subResolve) => {
    server = app.listen(0, '127.0.0.1', () => subResolve());
  }).then(async () => {
    const address = server.address() as AddressInfo;
    app.server = server;
    app.address = address.address;
    app.port = address.port;
    app.baseUrl = `http://${address.address}:${address.port}`;
    app.document = document;
    app.client = new OpraHttpClient(app.baseUrl, {document});
    return app;
  });
}
