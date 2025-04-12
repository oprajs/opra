import { HttpIncoming, NodeIncomingMessage } from '@opra/http';
import { expect } from 'expect';

describe('HttpIncoming', () => {
  it('Should wrap HttpIncomingMessage', async () => {
    const msg = HttpIncoming.from(
      NodeIncomingMessage.from({
        method: 'get',
      }),
    );
    expect(msg.method).toStrictEqual('GET');
  });

  it('Should create with HttpIncomingMessage initiator', async () => {
    const msg = HttpIncoming.from({ method: 'get' });
    expect(msg.method).toStrictEqual('GET');
  });

  it('Should return protocol', async () => {
    const msg = HttpIncoming.from({ method: 'get' });
    expect(msg.protocol).toStrictEqual('http');
    expect(msg.secure).toStrictEqual(false);
    msg.headers['x-forwarded-proto'] = 'https';
    expect(msg.protocol).toStrictEqual('https');
    expect(msg.secure).toStrictEqual(true);
  });

  it('Should return hostname', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Host', 'tempuri.org'],
    });
    expect(msg.hostname).toStrictEqual('tempuri.org');
    msg.headers['x-forwarded-host'] = 'anyuri.org';
    expect(msg.hostname).toStrictEqual('anyuri.org');
    msg.headers['x-forwarded-host'] = 'anyuri.org,otheruri.org';
    expect(msg.hostname).toStrictEqual('anyuri.org');
  });

  it('Should accepts() check if the given type(s) is acceptable', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Accept', 'text/*, application/json'],
    });
    expect(msg.accepts('html')).toStrictEqual('html');
    expect(msg.accepts('application/json')).toStrictEqual('application/json');
    expect(msg.accepts('json')).toStrictEqual('json');
    expect(msg.accepts('jpeg')).toStrictEqual(false);
  });

  it('Should acceptsCharsets() check if given charset is acceptable', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Accept-Charset', 'utf-8, ascii'],
    });
    expect(msg.acceptsCharsets('utf-8')).toStrictEqual('utf-8');
    expect(msg.acceptsCharsets('ascii')).toStrictEqual('ascii');
    expect(msg.acceptsCharsets('utf-16')).toStrictEqual(false);
  });

  it('Should acceptsEncodings() check given encoding is acceptable', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Accept-Encoding', 'gzip, compress;q=0.2'],
    });
    expect(msg.acceptsEncodings('gzip')).toStrictEqual('gzip');
    expect(msg.acceptsEncodings('compress')).toStrictEqual('compress');
    expect(msg.acceptsEncodings('deflate')).toStrictEqual(false);
  });

  it('Should acceptsLanguages() check given language is acceptable', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Accept-Language', 'en;q=0.8, es, pt'],
    });
    expect(msg.acceptsLanguages('en')).toStrictEqual('en');
    expect(msg.acceptsLanguages('pt')).toStrictEqual('pt');
    expect(msg.acceptsEncodings('fr')).toStrictEqual(false);
  });

  it('Should is() check content-type matches given value', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Content-Type', 'text/html'],
    });
    expect(msg.is('html')).toStrictEqual('html');
    expect(msg.is('text', 'html')).toStrictEqual('html');
    expect(msg.is(['text', 'html'])).toStrictEqual('html');
    expect(msg.is('text')).toStrictEqual(false);
    expect(msg.is('text/*')).toStrictEqual('text/html');
    expect(msg.is('json')).toStrictEqual(false);
  });

  it('Should range() return parsed "Range" header', async () => {
    const msg = HttpIncoming.from({
      method: 'get',
      headers: ['Range', 'bytes=50-55,0-10,5-10,56-60'],
    });
    const result: any = msg.range(100);
    expect(Array.isArray(result)).toStrictEqual(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toEqual({ start: 50, end: 55 });
  });
});
