import { Readable } from 'node:stream';
import { expect } from 'expect';
import { ServerResponseHost } from '../../src/index.js';

describe('http:http:ServerResponseHost', () => {
  it('Should create using init object', async () => {
    const msg = ServerResponseHost.create({} as any, {
      statusCode: 200,
      statusMessage: 'OK',
      headers: { Accept: 'text/html' },
      trailers: { 'X-Custom-Field': 'x' },
    });
    expect(msg.statusCode).toStrictEqual(200);
    expect(msg.statusMessage).toStrictEqual('OK');
    expect(msg.getHeaderNames()).toEqual(['accept']);
    expect(msg.getHeaders()).toEqual({ accept: 'text/html' });
  });

  it('Should create using Buffer', async () => {
    const msg = await ServerResponseHost.from(
      {} as any,
      [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        'Transfer-Encoding: chunked',
        '',
        '4',
        'test',
        '0',
        'Expires: x',
        '',
      ].join('\r\n'),
    );
    expect(msg.statusCode).toStrictEqual(200);
    expect(msg.statusMessage).toStrictEqual('OK');
    expect(msg.getHeaders()).toEqual({
      'content-type': 'text/plain',
      'transfer-encoding': 'chunked',
    });
  });

  it('Should serialize to raw HTTP', async () => {
    const body = 'hello world';
    const res = ServerResponseHost.create({} as any, {
      statusCode: 201,
      statusMessage: 'Created',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': String(Buffer.byteLength(body)),
      },
    });

    // Serialize: write body through the fake socket into the capacitor
    await new Promise<void>(resolve => {
      res.once('finish', () => {
        resolve();
      });
      res.end(body, 'utf-8');
    });

    // Read the full raw HTTP response from the capacitor
    const chunks: Buffer[] = [];
    for await (const chunk of res.capacitor.createReadStream()) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any));
    }
    const rawHttp = Buffer.concat(chunks).toString('utf-8');

    // Status line and headers
    expect(rawHttp).toContain('HTTP/1.1 201 Created\r\n');
    expect(rawHttp).toContain('Content-Type: text/plain\r\n');
    expect(rawHttp).toContain(`Content-Length: ${Buffer.byteLength(body)}\r\n`);
    // Body follows after the blank line
    expect(rawHttp.split('\r\n\r\n')[1]).toBe(body);
  });

  it('Should serialize to raw HTTP when body is piped as a stream', async () => {
    const body = 'streamed body content';
    const res = ServerResponseHost.create({} as any, {
      statusCode: 200,
      statusMessage: 'OK',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': String(Buffer.byteLength(body)),
      },
    });

    const bodyStream = Readable.from([Buffer.from(body, 'utf-8')]);
    await new Promise<void>((resolve, reject) => {
      res.once('finish', resolve);
      res.once('error', reject);
      bodyStream.on('data', chunk => res.write(chunk));
      bodyStream.on('end', () => res.end());
      bodyStream.on('error', err => res.emit('error', err));
    });

    const chunks: Buffer[] = [];
    for await (const chunk of res.capacitor.createReadStream()) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any));
    }
    const rawHttp = Buffer.concat(chunks).toString('utf-8');

    expect(rawHttp).toContain('HTTP/1.1 200 OK\r\n');
    expect(rawHttp).toContain('Content-Type: text/plain\r\n');
    expect(rawHttp).toContain(`Content-Length: ${Buffer.byteLength(body)}\r\n`);
    expect(rawHttp.split('\r\n\r\n')[1]).toBe(body);
  });
});
