import fs from 'fs';
import { ApiDocument, Storage } from '@opra/common';
import { HttpAdapter, HttpServerRequest, HttpServerResponse, MultipartItem } from '@opra/core';
import { ExecutionContextHost } from '@opra/core/execution-context.host';
import { StorageRequestHandler } from '@opra/core/http/request-handlers/storage-request-handler';
import { createTestApi } from '../_support/test-app/index.js';

describe('parse Storage Request', function () {

  let api: ApiDocument;
  let requestHandler: StorageRequestHandler;

  beforeAll(async () => {
    api = await createTestApi();
    const adapter = await HttpAdapter.create(api);
    requestHandler = new StorageRequestHandler(adapter as any);
  });

  describe('parse "post" operation', function () {

    it('Should parse request and getAll', async () => {
      const incoming = HttpServerRequest.from({
        method: 'POST',
        url: '/files',
        body: Buffer.from(
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
        ),
        headers: {'content-type': 'multipart/form-data; boundary=AaB03x'}
      });
      const outgoing = HttpServerResponse.from();
      const context = new ExecutionContextHost(api, 'http', {http: {incoming, outgoing}})
      const request = await requestHandler.parseRequest(context, incoming) as Storage.Post.Request;
      try {
        expect(request).toBeDefined();
        const resource = api.getStorage('Files');
        expect(request.resource).toEqual(resource);
        expect(request.operation).toStrictEqual('post');
        const items = await request.parts.getAll();
        expect(items).toBeDefined();
        expect(items.length).toStrictEqual(2);
        expect(items[0]).toMatchObject({
          field: 'field1',
          value: 'Joe Blow\r\nalmost tricked you!'
        });
        expect(items[1]).toMatchObject({
          field: 'pics',
          file: {
            mimetype: 'text/plain',
            originalFilename: 'file1.txt',
            size: /\d+/
          }
        });
        // Check if files exists
        for (const item of items) {
          if (item.file) {
            expect(fs.existsSync(item.file.filepath)).toBeTruthy();
            expect(fs.statSync(item.file.filepath).size).toBeGreaterThan(0);
          }
        }
        // Check if it deletes files after finish
        await context.emitAsync('finish');
        for (const item of items) {
          if (item.file) {
            const exists = fs.existsSync(item.file.filepath);
            expect(exists).not.toBeTruthy();
          }
        }
      } finally {
        // Delete temp files
        await context.emitAsync('finish');
      }
    })

    it('Should parse request and get one at a time', async () => {
      const incoming = HttpServerRequest.from({
        method: 'POST',
        url: '/files',
        body: Buffer.from(
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
        ),
        headers: {'content-type': 'multipart/form-data; boundary=AaB03x'}
      });
      const outgoing = HttpServerResponse.from();
      const context = new ExecutionContextHost(api, 'http', {http: {incoming, outgoing}})
      const request = await requestHandler.parseRequest(context, incoming) as Storage.Post.Request;
      try {
        expect(request).toBeDefined();
        const resource = api.getStorage('Files');
        expect(request.resource).toEqual(resource);
        expect(request.operation).toStrictEqual('post');
        let item: MultipartItem | undefined;
        let i = 0;
        while ((item = await request.parts.getNext())) {
          if (i === 0) {
            expect(item).toMatchObject({
              field: 'field1',
              value: 'Joe Blow\r\nalmost tricked you!'
            });
          } else if (i === 1) {
            expect(item).toMatchObject({
              field: 'pics',
              file: {
                mimetype: 'text/plain',
                originalFilename: 'file1.txt',
                size: /\d+/
              }
            });
          }
          i++;
        }
        expect(i).toStrictEqual(2);
        // Check if files exists
        for (const item1 of request.parts.items) {
          if (item1.file) {
            expect(fs.existsSync(item1.file.filepath)).toBeTruthy();
            expect(fs.statSync(item1.file.filepath).size).toBeGreaterThan(0);
          }
        }
        // Check if it deletes files after finish
        await context.emitAsync('finish');
        for (const item1 of request.parts.items) {
          if (item1.file) {
            const exists = fs.existsSync(item1.file.filepath);
            expect(exists).not.toBeTruthy();
          }
        }
      } finally {
        // Delete temp files
        await context.emitAsync('finish');
      }
    })

  });

});

