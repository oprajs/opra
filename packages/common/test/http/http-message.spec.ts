import { HTTPParser } from 'http-parser-js';
import { HttpMessage, HttpMessageHost } from '../../src/http/http-message.host.js';

class TestMessage extends HttpMessageHost {

  constructor() {
    super();
  }

  static create(init: HttpMessage.Initiator): TestMessage {
    const msg = new TestMessage();
    msg._init(init);
    return msg;
  }

  static fromBuffer(buffer: Buffer | ArrayBuffer): TestMessage {
    const msg = new TestMessage();
    msg._parseBuffer(buffer, HTTPParser.REQUEST);
    return msg;
  }
}

describe('HttpMessageHost', function () {

  it('Should create using init object', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html'],
      rawTrailers: ['X-Custom-Field', 'x'],
      body: 'test',
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(0);
    expect(msg.rawHeaders).toStrictEqual(['Accept', 'text/html']);
    expect(msg.rawTrailers).toStrictEqual(['X-Custom-Field', 'x']);
    expect(msg.body).toStrictEqual('test');
  })

  it('Should create using Buffer', async () => {
    const msg = TestMessage.fromBuffer(Buffer.from(
        [
          'GET /test HTTP/1.1',
          'Host: 0.0.0.0=5000',
          'Accept: */*',
          '', ''
        ].join('\r\n')
    ));
    expect(msg.complete).toStrictEqual(true);
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(1);
    expect(msg.rawHeaders).toStrictEqual(['Host', '0.0.0.0=5000', 'Accept', '*/*']);
    expect(msg.get('Host')).toStrictEqual('0.0.0.0=5000');
  })

  it('Should initialize Headers proxy object from rawHeaders array', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referrer', 'x']
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.headers).toBeDefined();
    expect(msg.headers.referrer).toStrictEqual('x');
    expect(msg.getHeader('referrer')).toStrictEqual('x');
    expect(msg.getHeader('referer')).toStrictEqual('x');
    expect(msg.getHeader('Accept')).toStrictEqual('text/html');
    expect(msg.get('Accept')).toStrictEqual('text/html');
  })

  it('Should initialize Trailers proxy object from rawTrailers array', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawTrailers: ['Accept', 'text/html', 'referrer', 'x']
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.trailers).toBeDefined();
    expect(msg.trailers.referrer).toStrictEqual('x');
  })

  it('Should update rawHeaders on change any header value', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html']
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.headers).toBeDefined();
    expect(msg.headers.accept).toStrictEqual('text/html');
    msg.headers.accept = 'application/json';
    msg.headers['accept-language'] = 'tr';
    msg.headers['set-cookie'] = ['x', 'y'];
    expect(msg.rawHeaders).toStrictEqual([
      'accept', 'application/json',
      'accept-language', 'tr',
      'set-cookie', 'x',
      'set-cookie', 'y',
    ]);
  })

  it('Should update rawTrailers on change any trailer value', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawTrailers: ['Accept', 'text/html']
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.trailers).toBeDefined();
    expect(msg.trailers.accept).toStrictEqual('text/html');
    msg.trailers.accept = 'application/json';
    msg.trailers['accept-language'] = 'tr';
    msg.trailers['set-cookie'] = ['x', 'y'];
    expect(msg.rawTrailers).toStrictEqual([
      'accept', 'application/json',
      'accept-language', 'tr',
      'set-cookie', 'x',
      'set-cookie', 'y',
    ]);
  })

  it('Should update Headers on rawHeaders change', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referrer', 'x']
    });
    msg.rawHeaders = ['Accept', 'text/xml', 'referrer', 'y'];
    expect(msg.complete).toStrictEqual(true);
    expect(msg.headers).toBeDefined();
    expect(msg.headers.referrer).toStrictEqual('y');
    expect(msg.getHeader('referrer')).toStrictEqual('y');
    expect(msg.getHeader('referer')).toStrictEqual('y');
    expect(msg.getHeader('Accept')).toStrictEqual('text/xml');
    expect(msg.get('Accept')).toStrictEqual('text/xml');
  })

  it('Should update Trailers on rawTrailers change', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawTrailers: ['Accept', 'text/html', 'referrer', 'x']
    });
    msg.rawTrailers = ['Accept', 'text/xml', 'referrer', 'y'];
    expect(msg.complete).toStrictEqual(true);
    expect(msg.trailers).toBeDefined();
    expect(msg.trailers.referrer).toStrictEqual('y');
    expect(msg.trailers.Accept).toStrictEqual('text/xml');
  })

  it('Should setHeader(name, value) update header value', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referrer', 'x']
    });
    msg.setHeader('accept', 'text/xml');
    expect(msg.get('Accept')).toStrictEqual('text/xml');
    msg.set('accept', 'text/html');
    expect(msg.get('Accept')).toStrictEqual('text/html');
  })

  it('Should setHeader(obj) update header values', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referrer', 'x']
    });
    msg.setHeader({'accept': 'text/xml'});
    expect(msg.get('Accept')).toStrictEqual('text/xml');
    msg.setHeader({'accept': 'text/html'});
    expect(msg.get('Accept')).toStrictEqual('text/html');
  })

  it('Should getHeaders() return swallow copy of headers', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referer', 'x']
    });
    expect(msg.getHeaders()).toStrictEqual({
      'Accept': 'text/html',
      'Referer': 'x'
    })
  })

  it('Should getHeaderNames() return header names', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referer', 'x']
    });
    expect(msg.getHeaderNames()).toStrictEqual(['Accept', 'Referer']);
  })

  it('Should hasHeader() check if header exists', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referer', 'x']
    });
    expect(msg.hasHeader('Accept')).toStrictEqual(true);
    expect(msg.hasHeader('Referer')).toStrictEqual(true);
    expect(msg.hasHeader('Content-Type')).toStrictEqual(false);
  })

  it('Should removeHeader() remove header', async () => {
    const msg = TestMessage.create({
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html', 'referer', 'x']
    });
    expect(msg.hasHeader('Accept')).toStrictEqual(true);
    expect(msg.hasHeader('Referer')).toStrictEqual(true);
    msg.removeHeader('referer');
    expect(msg.hasHeader('Referer')).toStrictEqual(false);
  })

});
