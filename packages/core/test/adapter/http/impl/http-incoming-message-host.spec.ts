import { HttpIncomingMessageHost } from '@opra/core';

describe('HttpIncomingMessageHost', function () {

  it('Should create using init object (raw headers)', async () => {
    const msg = HttpIncomingMessageHost.create({
      url: '/test',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      headers: ['accept', 'text/html'],
      trailers: ['X-Custom-Field', 'x'],
      body: 'test',
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.url).toStrictEqual('/test');
    expect(msg.method).toStrictEqual('GET');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(0);
    expect(msg.rawHeaders).toStrictEqual(['accept', 'text/html']);
    expect(msg.rawTrailers).toStrictEqual(['X-Custom-Field', 'x']);
    expect(msg.headers).toEqual({'accept': 'text/html'});
    expect(msg.trailers).toEqual({'x-custom-field': 'x'});
    expect(msg.body).toStrictEqual('test');
  })

  it('Should create using init object (object headers)', async () => {
    const msg = HttpIncomingMessageHost.create({
      url: '/test',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      headers: {'accept': 'text/html'},
      trailers: {'X-Custom-Field': 'x'},
      body: 'test',
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.url).toStrictEqual('/test');
    expect(msg.method).toStrictEqual('GET');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(0);
    expect(msg.rawHeaders).toStrictEqual(['Accept', 'text/html']);
    expect(msg.rawTrailers).toStrictEqual(['X-Custom-Field', 'x']);
    expect(msg.headers).toEqual({'accept': 'text/html'});
    expect(msg.trailers).toEqual({'x-custom-field': 'x'});
    expect(msg.body).toStrictEqual('test');
  })

  it('Should create using Buffer', async () => {
    const msg = HttpIncomingMessageHost.create(Buffer.from(
        [
          'POST /test HTTP/1.1',
          'Content-Type: text/plain',
          'Transfer-Encoding: chunked',
          '',
          '4',
          'test',
          '0',
          'Expires: x', ''
        ].join('\r\n')
    ));
    expect(msg.complete).toStrictEqual(true);
    expect(msg.url).toStrictEqual('/test');
    expect(msg.method).toStrictEqual('POST');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(1);
    expect(msg.rawHeaders).toStrictEqual(['Content-Type', 'text/plain', 'Transfer-Encoding', 'chunked']);
    expect(msg.rawTrailers).toStrictEqual(['Expires', 'x']);
  })

});
