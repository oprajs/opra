import { HttpRequestMessage } from '@opra/common';

describe('HttpRequestMessage', function () {

  it('Should create using init object', async () => {
    const msg = HttpRequestMessage.create({
      method: 'post',
      url: '/customers',
      baseUrl: '/api',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html'],
      rawTrailers: ['X-Custom-Field', 'x'],
      body: 'test',
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.method).toStrictEqual('POST');
    expect(msg.url).toStrictEqual('/customers');
    expect(msg.baseUrl).toStrictEqual('/api');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(0);
    expect(msg.rawHeaders).toStrictEqual(['Accept', 'text/html']);
    expect(msg.rawTrailers).toStrictEqual(['X-Custom-Field', 'x']);
    expect(msg.body).toStrictEqual('test');
  })

  it('Should create using Buffer', async () => {
    const msg = HttpRequestMessage.fromBuffer(Buffer.from(
        [
          'POST /customers HTTP/1.1',
          'Accept: text/html',
          'Content-Length: 4',
          '', 'test', ''
        ].join('\r\n')
    ));
    expect(msg.complete).toStrictEqual(true);
    expect(msg.method).toStrictEqual('POST');
    expect(msg.url).toStrictEqual('/customers');
    expect(msg.baseUrl).toStrictEqual('/customers');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(1);
    expect(msg.rawHeaders).toStrictEqual(['Accept', 'text/html', 'Content-Length', '4']);
    expect(msg.body.toString('utf-8')).toStrictEqual('test');
  })

  it('Should header(name) return header value', async () => {
    const msg = HttpRequestMessage.create({
      method: 'post',
      url: '/customers',
      baseUrl: '/api',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html'],
      rawTrailers: ['X-Custom-Field', 'x'],
      body: 'test',
    });
    expect(msg.header('accept')).toStrictEqual('text/html');
  })

  it('Should "hostname" getter return Parse the "Host" header field', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Host', 'tempuri.org'],
    });
    expect(msg.hostname).toStrictEqual('tempuri.org');
    msg.rawHeaders = ['X-Forwarded-Host', 'x.tempuri.org'];
    expect(msg.hostname).toStrictEqual('x.tempuri.org');
  })

  it('Should get "protocol"', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      protocol: 'http',
      rawHeaders: ['X-Forwarded-Proto', 'https']
    });
    expect(msg.protocol).toStrictEqual('http');
    expect(msg.secure).toStrictEqual(false);
    msg.protocol = '';
    expect(msg.protocol).toStrictEqual('https');
    expect(msg.secure).toStrictEqual(true);
  })

  it('Should accepts() check if the given `type(s)` is acceptable', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/*, application/json'],
    });
    expect(msg.accepts('html')).toStrictEqual('html');
  })

  it('Should accepts() check if the given `type(s)` is acceptable', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept-Charset', 'utf-8, ascii'],
    });
    expect(msg.acceptsCharsets('utf-8')).toStrictEqual('utf-8');
    expect(msg.acceptsCharsets('ascii')).toStrictEqual('ascii');
    expect(msg.acceptsCharsets('utf-16')).toStrictEqual(false);
  })

  it('Should accepts() check if the given `type(s)` is acceptable', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept-Encoding', 'gzip, compress;q=0.2'],
    });
    expect(msg.acceptsEncodings('gzip')).toStrictEqual('gzip');
    expect(msg.acceptsEncodings('compress')).toStrictEqual('compress');
    expect(msg.acceptsEncodings('deflate')).toStrictEqual(false);
  })

  it('Should accepts() check if the given `type(s)` is acceptable', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept-Language', 'en;q=0.8, es, pt'],
    });
    expect(msg.acceptsLanguages('en')).toStrictEqual('en');
    expect(msg.acceptsLanguages('pt')).toStrictEqual('pt');
    expect(msg.acceptsEncodings('fr')).toStrictEqual(false);
  })

  it('Should is() check content-type matches given value', async () => {
    const msg = HttpRequestMessage.create({
      method: 'get',
      url: '/customers',
      rawHeaders: ['Content-Type', 'text/html']
    });
    expect(msg.is('html')).toStrictEqual('html');
    expect(msg.is('text', 'html')).toStrictEqual('html');
    expect(msg.is(['text', 'html'])).toStrictEqual('html');
    expect(msg.is('text')).toStrictEqual(false);
    expect(msg.is('text/*')).toStrictEqual('text/html');
    expect(msg.is('json')).toStrictEqual(false);
  })


});
