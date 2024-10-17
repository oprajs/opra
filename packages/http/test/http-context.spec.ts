import { ApiDocument, HttpOperation } from '@opra/common';
import { ExpressAdapter, HttpContext, HttpIncoming, HttpOutgoing, NodeIncomingMessage } from '@opra/http';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import { createTestApi } from './_support/test-api/index.js';

describe('HttpContext', () => {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapter;

  function createContext(operation: HttpOperation, request: HttpIncoming) {
    const response = HttpOutgoing.from({ req: request });
    return new HttpContext({
      adapter,
      operation,
      controller: operation.owner,
      platform: 'express',
      request,
      response,
    });
  }

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    app.use(cookieParser());
    adapter = new ExpressAdapter(app);
    adapter.initialize(document);
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should getBody() retrieve body content', async () => {
    const controller = document.httpApi?.findController('Customer');
    const operation = controller!.operations.get('update')!;
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer@1 HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            'F',
            '{"active":true}',
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    context.request.params.customerId = 1;
    await adapter.handler.parseRequest(context);
    const body = await context.getBody();
    expect(body).toEqual({ active: true });
  });

  it('Should validate body content', async () => {
    const controller = document.httpApi?.findController('Customer');
    const operation = controller!.operations.get('update')!;
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            'C',
            '{"rate":"x"}',
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    await await expect(() => adapter.handler.parseRequest(context)).rejects.toThrow('not a valid number');
  });

  it('Should return MultipartReader if content is multipart', async () => {
    const controller = document.httpApi?.findController('Files');
    const operation = controller!.operations.get('post')!;
    const s = [
      '--AaB03x',
      'content-disposition: form-data; name="notes"',
      '',
      'Joe Blow\r\nalmost tricked you!',
      '',
      '--AaB03x',
      'content-disposition: form-data; name="file1"; filename="file1.txt"',
      'Content-Type: text/plain',
      '',
      '... contents of file1.txt ...',
      '--AaB03x',
      'content-disposition: form-data; name="notes2"',
      '',
      'Ignore this!',
      '',
      '--AaB03x--',
    ].join('\r\n');
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer HTTP/1.1',
            'Content-Type: multipart/form-data; boundary=AaB03x',
            'Content-Length: ' + s.length,
            '',
            s,
            '',
          ].join('\r\n'),
        ),
      ),
    );
    await adapter.handler.parseRequest(context);
    const reader = await context.getMultipartReader();
    let parts = await reader.getAll();
    expect(parts).toBeDefined();
    expect(parts.length).toEqual(3);
    parts = await context.getBody();
    expect(parts).toBeDefined();
    expect(parts.length).toEqual(3);
  });
});
