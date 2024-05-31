import { NodeOutgoingMessage } from '@opra/core';

describe('NodeOutgoingMessage', function () {
  afterAll(() => global.gc && global.gc());

  it('Should create using init object', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      statusCode: 200,
      statusMessage: 'OK',
      headers: { accept: 'text/html' },
      body: 'test',
    });
    expect(msg.statusCode).toStrictEqual(200);
    expect(msg.statusMessage).toStrictEqual('OK');
    expect(msg.getHeaders()).toEqual({ accept: 'text/html' });
    expect((msg as any).body).toStrictEqual('test');
  });

  it('Should getHeader() return header value', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { accept: 'text/html' },
    });
    expect(msg.getHeader('accept')).toStrictEqual('text/html');
    expect(msg.getHeader('Accept')).toStrictEqual('text/html');
  });

  it('Should setHeader() overwrite header value', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { accept: 'text/html' },
    });
    expect(msg.getHeader('Accept')).toStrictEqual('text/html');
    msg.setHeader('accept', 'text/xml');
    expect(msg.getHeader('Accept')).toStrictEqual('text/xml');
  });

  it('Should appendHeader() append header value', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { accept: 'text/html' },
    });
    msg.appendHeader('accept', 'text/xml');
    expect(msg.getHeader('Accept')).toStrictEqual(['text/html', 'text/xml']);
  });

  it('Should getHeaders() return swallow copy of headers', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { Accept: 'text/html', Referer: 'x' },
    });
    expect(msg.getHeaders()).toEqual({
      accept: 'text/html',
      referer: 'x',
    });
  });

  it('Should getHeaderNames() return header names', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { Accept: 'text/html', Referer: 'x' },
    });
    expect(msg.getHeaderNames()).toStrictEqual(['accept', 'referer']);
  });

  it('Should getRawHeaderNames() return raw header names', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { Accept: 'text/html', Referer: 'x' },
    });
    expect(msg.getRawHeaderNames()).toStrictEqual(['Accept', 'Referer']);
  });

  it('Should hasHeader() check if header exists', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { Accept: 'text/html', Referer: 'x' },
    });
    expect(msg.hasHeader('accept')).toStrictEqual(true);
    expect(msg.hasHeader('Accept')).toStrictEqual(true);
    expect(msg.hasHeader('referer')).toStrictEqual(true);
    expect(msg.hasHeader('Referer')).toStrictEqual(true);
    expect(msg.hasHeader('content-type')).toStrictEqual(false);
  });

  it('Should removeHeader() remove header', async () => {
    const msg = NodeOutgoingMessage.from({
      req: {} as any,
      headers: { Accept: 'text/html', Referer: 'x' },
    });
    expect(msg.hasHeader('Accept')).toStrictEqual(true);
    expect(msg.hasHeader('Referer')).toStrictEqual(true);
    msg.removeHeader('referer');
    expect(msg.hasHeader('Referer')).toStrictEqual(false);
  });
});
