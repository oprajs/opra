/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { HttpAdapterHost } from '@opra/core/adapter/http/http-adapter.host.js';
import { FilesResource } from '../../../core/test/_support/test-app/resources/files.resource.js';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Storage', function () {

  let api: ApiDocument;
  let adapter: HttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await HttpAdapter.create(api) as HttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "post" operation', async () => {
    await supertest(adapter.server).post('/Files')
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
  });

  it('Should execute "get" operation', async () => {
    const resp = await supertest(adapter.server).get('/Files/file1.txt');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      fileName: 'file1.txt'
    });
  });

  it('Should execute "delete" operation', async () => {
    const resp = await supertest(adapter.server).delete('/Files/file1.txt');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      deleted: 'file1.txt'
    });
  });


});
