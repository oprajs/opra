import { ApiDocument } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import { OpraTestClient } from '@opra/testing';
import express, { Express } from 'express';
import supertest from 'supertest';
import { FilesController } from '../../_support/test-api/api/files.controller.js';
import { createTestApi } from '../../_support/test-api/index.js';

describe('e2e:Storage', () => {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapter;
  const testArgs: any = {};

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    adapter = new ExpressAdapter(app, document);
    testArgs.app = app;
    testArgs.client = new OpraTestClient(app, { document });
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should execute "post" operation', async () => {
    const resp = await supertest(adapter.app)
      .post('/Files')
      .set('content-type', 'multipart/form-data; boundary=AaB03x')
      .send(
        Buffer.from(
          '--AaB03x\r\n' +
            'content-disposition: form-data; name="notes"\r\n' +
            '\r\n' +
            'Joe Blow\r\nalmost tricked you!\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file1"; filename="file1.txt"\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            '... contents of file1.txt ...\r\r\n' +
            '--AaB03x--\r\n',
        ),
      );
    expect(FilesController.lastPost).toBeDefined();
    expect(Array.isArray(FilesController.lastPost)).toBeTruthy();
    expect(FilesController.lastPost[0].fieldName).toStrictEqual('notes');
    expect(FilesController.lastPost[1].fieldName).toStrictEqual('file1');
    expect(resp.type).toStrictEqual('application/opra.response+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.payload).toBeDefined();
    expect(resp.body.payload.title).toStrictEqual('title');
    expect(resp.body.payload.text).toStrictEqual('notes');
  });
});
