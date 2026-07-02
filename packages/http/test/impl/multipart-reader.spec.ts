import { Readable } from 'node:stream';
import { expect } from 'expect';
import MultipartStream from 'multipart-stream';
import { IncomingMessageHost, MultipartReader } from '../../src/index.js';

/**
 * Helper: build a multipart/mixed request with the given parts,
 * return an IncomingMessage ready to be passed to MultipartReader2.
 */
async function makeRequest(
  parts: {
    headers: Record<string, string>;
    body: string | Buffer;
  }[],
) {
  const ms = new MultipartStream();
  for (const part of parts) {
    ms.addPart({
      headers: part.headers,
      body: Readable.from([
        Buffer.isBuffer(part.body) ? part.body : Buffer.from(part.body),
      ]),
    });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of ms) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any));
  }
  const body = Buffer.concat(chunks);

  return IncomingMessageHost.create({
    method: 'POST',
    url: '/upload',
    headers: {
      'content-type': `multipart/mixed; boundary=${ms.boundary}`,
      'content-length': String(body.length),
    },
    body,
  });
}

describe('http:MultipartReader', () => {
  it('Should read a single file part', async () => {
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition':
            'form-data; name="file1"; filename="hello.txt"',
          'Content-Type': 'text/plain',
        },
        body: 'hello world',
      },
    ]);

    const reader = new MultipartReader(req as any);
    const item = await reader.getNext();
    expect(item).toBeDefined();
    expect(item!.kind).toBe('file');
    const file = item as MultipartReader.File;
    expect(file.field).toBe('file1');
    expect(file.filename).toBe('hello.txt');
    expect(file.type).toBe('text/plain');
    const text = await file.text();
    expect(text).toBe('hello world');

    const done = await reader.getNext();
    expect(done).toBeUndefined();

    await reader.purge();
  });

  it('Should read a field part', async () => {
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="username"',
          'Content-Type': 'text/plain',
        },
        body: 'alice',
      },
    ]);

    const reader = new MultipartReader(req as any);
    const item = await reader.getNext();
    expect(item).toBeDefined();
    expect(item!.kind).toBe('field');
    expect(item!.field).toBe('username');
    expect((item as MultipartReader.Field).value).toBe('alice');

    const done = await reader.getNext();
    expect(done).toBeUndefined();
  });

  it('Should read multiple parts via getAll()', async () => {
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="f1"; filename="a.txt"',
          'Content-Type': 'text/plain',
        },
        body: 'aaa',
      },
      {
        headers: {
          'Content-Disposition': 'form-data; name="f2"; filename="b.txt"',
          'Content-Type': 'text/plain',
        },
        body: 'bbb',
      },
    ]);

    const reader = new MultipartReader(req as any);
    const items = await reader.getAll();
    expect(items.length).toBe(2);
    expect(items[0].kind).toBe('file');
    expect(items[1].kind).toBe('file');
    expect(await (items[0] as MultipartReader.File).text()).toBe('aaa');
    expect(await (items[1] as MultipartReader.File).text()).toBe('bbb');

    await reader.purge();
  });

  it('Should expose custom part headers (e.g. Request-Id)', async () => {
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="req"; filename="request"',
          'Content-Type': 'application/http',
          'Request-Id': '42',
        },
        body: 'GET /api/ping HTTP/1.1\r\nHost: localhost\r\n\r\n',
      },
    ]);

    const reader = new MultipartReader(req as any);
    const item = await reader.getNext();
    expect(item).toBeDefined();
    expect(item!.kind).toBe('file');
    const file = item as MultipartReader.File;
    expect(file.headers['request-id']).toBe('42');

    await reader.purge();
  });

  it('Should expose headers on all parts', async () => {
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="req"; filename="r1"',
          'Content-Type': 'application/http',
          'Request-Id': '1',
        },
        body: 'GET /api/ping HTTP/1.1\r\nHost: localhost\r\n\r\n',
      },
      {
        headers: {
          'Content-Disposition': 'form-data; name="req"; filename="r2"',
          'Content-Type': 'application/http',
          'Request-Id': '2',
        },
        body: 'GET /api/users HTTP/1.1\r\nHost: localhost\r\n\r\n',
      },
    ]);

    const reader = new MultipartReader(req as any);
    const items = await reader.getAll();
    expect(items.length).toBe(2);
    expect((items[0] as MultipartReader.File).headers['request-id']).toBe('1');
    expect((items[1] as MultipartReader.File).headers['request-id']).toBe('2');

    await reader.purge();
  });

  it('Should work with multipart/mixed content-type (no rewrite needed)', async () => {
    // Unlike busboy, multipasta reads the boundary directly from any
    // multipart/* content-type without requiring multipart/form-data.
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="data"; filename="x.bin"',
          'Content-Type': 'application/octet-stream',
        },
        body: Buffer.from([0x01, 0x02, 0x03]),
      },
    ]);

    const reader = new MultipartReader(req as any);
    const item = await reader.getNext();
    expect(item!.kind).toBe('file');
    const buf = await (item as MultipartReader.File).buffer();
    expect(buf).toEqual(Buffer.from([0x01, 0x02, 0x03]));

    await reader.purge();
  });

  it('Should support custom isFile predicate', async () => {
    // Force all parts to be treated as fields (regardless of filename)
    const req = await makeRequest([
      {
        headers: {
          'Content-Disposition': 'form-data; name="note"; filename="note.txt"',
          'Content-Type': 'text/plain',
        },
        body: 'force field',
      },
    ]);

    const reader = new MultipartReader(req as any, {
      isFile: () => false,
    });
    const item = await reader.getNext();
    expect(item!.kind).toBe('field');
    expect((item as MultipartReader.Field).value).toBe('force field');
  });
});
