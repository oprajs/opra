/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { NodeHttpAdapterHost } from '@opra/core/http/adapters/node-http-adapter.host';
import { createTestApi } from '../_support/test-app/index.js';
import { FilesResource } from '../_support/test-app/resources/files.resource.js';

describe('e2e:Storage', function () {

  let api: ApiDocument;
  let adapter: NodeHttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await NodeHttpAdapter.create(api) as NodeHttpAdapterHost;
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should execute "post" operation', async () => {
    const resp = await supertest(adapter.server).post('/Files')
        .set('content-type', 'multipart/form-data; boundary=AaB03x')
        .send(Buffer.from(
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'Joe Blow\r\nalmost tricked you!\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            '... contents of file1.txt ...\r\r\n' +
            '--AaB03x--\r\n',
        ));
    expect(FilesResource.lastPost).toBeDefined();
    expect(Array.isArray(FilesResource.lastPost)).toBeTruthy();
    expect(FilesResource.lastPost[0].field).toStrictEqual('field1');
    expect(FilesResource.lastPost[1].field).toStrictEqual('pics');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Files');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Files$/);
    expect(resp.body.affected).toStrictEqual(1);
  });

  it('Should execute "get" operation', async () => {
    const resp = await supertest(adapter.server).get('/Files/file1.txt');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toMatchObject({
      fileName: 'file1.txt'
    });
  });

  it('Should execute "delete" operation', async () => {
    const resp = await supertest(adapter.server).delete('/Files/file1.txt');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Files');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Files$/);
    expect(resp.body.affected).toStrictEqual(1);
  });


});
