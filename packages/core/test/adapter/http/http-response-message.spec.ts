import { HttpResponseMessageHost } from '@opra/core';

describe('HttpResponseMessage', function () {

  it('Should create using init object', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK',
      httpVersionMajor: 1,
      httpVersionMinor: 0,
      rawHeaders: ['Accept', 'text/html'],
      rawTrailers: ['X-Custom-Field', 'x'],
      body: 'test'
    });
    expect(msg.complete).toStrictEqual(true);
    expect(msg.statusCode).toStrictEqual(200);
    expect(msg.statusMessage).toStrictEqual('OK');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(0);
    expect(msg.rawHeaders).toStrictEqual(['Accept', 'text/html']);
    expect(msg.rawTrailers).toStrictEqual(['X-Custom-Field', 'x']);
    expect(msg.body).toStrictEqual('test');
  })

  it('Should create using Buffer', async () => {
    const msg = HttpResponseMessageHost.fromBuffer(Buffer.from(
        [
          'HTTP/1.1 200 OK',
          'Content-Type: text/xml',
          'Content-Length: 4',
          '', 'test', ''
        ].join('\r\n')
    ));
    expect(msg.complete).toStrictEqual(true);
    expect(msg.statusCode).toStrictEqual(200);
    expect(msg.statusMessage).toStrictEqual('OK');
    expect(msg.httpVersionMajor).toStrictEqual(1);
    expect(msg.httpVersionMinor).toStrictEqual(1);
    expect(msg.rawHeaders).toStrictEqual(['Content-Type', 'text/xml', 'Content-Length', '4']);
    expect(msg.body.toString('utf-8')).toStrictEqual('test');
  })

  it('Should header(name) set header value', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK',
      rawHeaders: ['Accept', 'text/html'],
      rawTrailers: ['X-Custom-Field', 'x']
    });
    expect(msg.get('accept')).toStrictEqual('text/html');
    msg.header('accept', 'text/xml');
    expect(msg.get('accept')).toStrictEqual('text/xml');
  })

  it('Should append(name) add header value', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK',
      rawHeaders: ['Accept-Language', 'tr'],
      rawTrailers: ['X-Custom-Field', 'x']
    });
    expect(msg.get('accept-language')).toStrictEqual('tr');
    msg.append('accept-language', 'fr');
    expect(msg.get('accept-language')).toStrictEqual('tr, fr');
    expect(msg.get('set-cookie')).toStrictEqual(undefined);
    msg.append('set-cookie', 'x');
    expect(msg.get('set-cookie')).toStrictEqual(['x']);
    msg.append('set-cookie', 'y');
    expect(msg.get('set-cookie')).toStrictEqual(['x', 'y']);
  })

  it('Should attachment(name) set Content-Disposition header', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK',
    });
    msg.attachment();
    expect(msg.get('Content-Disposition')).toStrictEqual('attachment');
    msg.attachment('image.jpg');
    expect(msg.get('Content-Disposition')).toStrictEqual('attachment; filename="image.jpg"');
  })

  it('Should contentType(type) or type(type) set Content-Type header', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK',
      rawHeaders: ['Content-Type', 'application/json']
    });
    expect(msg.get('Content-Type')).toStrictEqual('application/json');
    msg.contentType('text/xml');
    expect(msg.get('Content-Type')).toStrictEqual('text/xml');
    msg.type('text/html');
    expect(msg.get('Content-Type')).toStrictEqual('text/html');
  })

  it('Should cookie() set Set-Cookie header', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    msg.cookie('c1', 'x', {path: '/api'});
    expect(msg.get('Set-Cookie')).toStrictEqual(['c1=x; Path=/api']);
  })

  it('Should clearCookie() delete Set-Cookie header', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    msg.cookie('c1', 'x', {path: '/api'});
    expect(msg.get('Set-Cookie')).toStrictEqual(['c1=x; Path=/api']);
    msg.clearCookie('c1');
    expect(msg.get('Set-Cookie')?.[0]).toMatch(/Expires/);
  })

  it('Should links() set Link header', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    msg.links({next: '/next', prior: '/prior'});
    expect(msg.get('Link')).toStrictEqual('</next>; rel="next", </prior>; rel="prior"');
  })

  it('Should redirect() set Location and statusCode', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    msg.redirect('www.newuri.org');
    expect(msg.get('Location')).toStrictEqual('www.newuri.org');
    expect(msg.statusCode).toStrictEqual(302);
  })

  it('Should status() set status code', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    expect(msg.statusCode).toStrictEqual(200);
    msg.status(400);
    expect(msg.statusCode).toStrictEqual(400);
  })

  it('Should sendStatus() set status code and body as status message', async () => {
    const msg = HttpResponseMessageHost.create({
      statusCode: 200,
      statusMessage: 'OK'
    });
    expect(msg.statusCode).toStrictEqual(200);
    msg.sendStatus(400);
    expect(msg.statusCode).toStrictEqual(400);
    expect(msg.body).toStrictEqual('Bad Request');
  })

});
