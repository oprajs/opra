import { HttpHeaders } from '@opra/common';

describe('HttpHeaders', function () {

  it('Should add entries', async () => {
    const headers = new HttpHeaders();
    headers.append('A', 'a');
    expect(headers.get('A')).toStrictEqual('a');
    headers.append('B', 1);
    expect(headers.get('B')).toStrictEqual('1');
    headers.append('set-cookie', ['a', 'b']);
    expect(headers.get('set-cookie')).toStrictEqual(['a', 'b']);
  })

  it('Should append() method append value to existing header', async () => {
    const headers = new HttpHeaders();
    headers.append('Accept-Language', 'tr-TR');
    expect(headers.size).toStrictEqual(1);
    expect(headers.get('Accept-Language')).toStrictEqual('tr-TR');
    headers.append('Accept-Language', ['en-US', 'en-GB']);
    expect(headers.size).toStrictEqual(1);
    expect(headers.get('Accept-Language')).toStrictEqual('tr-TR, en-US, en-GB');
  })

  it('Should store array if header is in NON_DELIMITED_HEADERS list', async () => {
    const headers = new HttpHeaders();
    headers.append('etag', ['x', 'y']);
    expect(headers.size).toStrictEqual(1);
    expect(headers.get('etag')).toStrictEqual('x');
  })

  it('Should set() method overwrite existing header', async () => {
    const headers = new HttpHeaders();
    headers.set('Accept-Language', 'tr-TR');
    expect(headers.size).toStrictEqual(1);
    expect(headers.get('Accept-Language')).toStrictEqual('tr-TR');
    headers.set('Accept-Language', 'en-GB');
    expect(headers.size).toStrictEqual(1);
    expect(headers.get('Accept-Language')).toStrictEqual('en-GB');
  })

  it('Should appendAll() method append all values in given object', async () => {
    const headers1 = new HttpHeaders();
    headers1.appendAll({
      'Accept-Language': 'tr',
      'Encoding': 'utf-8'
    });
    expect(headers1.size).toStrictEqual(2);
    expect(headers1.get('Accept-Language')).toStrictEqual('tr');
    expect(headers1.get('Encoding')).toStrictEqual('utf-8');
    const headers2 = new HttpHeaders();
    headers2.appendAll(headers1);
    expect(headers2.size).toStrictEqual(2);
    expect(headers2.get('Accept-Language')).toStrictEqual('tr');
    expect(headers2.get('Encoding')).toStrictEqual('utf-8');
    const headers3 = new HttpHeaders();
    headers3.parse('Accept-Language: tr\nEncoding: utf-8');
    expect(headers3.size).toStrictEqual(2);
    expect(headers3.get('Accept-Language')).toStrictEqual('tr');
    expect(headers3.get('Encoding')).toStrictEqual('utf-8');
  })

  it('Should get() method return value as string', async () => {
    const headers = new HttpHeaders();
    headers.append('Accept-Language', ['en-US', 'en-GB']);
    expect(headers.get('Accept-Language')).toStrictEqual('en-US, en-GB');
    headers.append('Cookie', ['a', 'b']);
    expect(headers.get('Cookie')).toStrictEqual('a; b');
  })

  it('Should clear() delete all entries', async () => {
    const headers = new HttpHeaders();
    headers.appendAll({
      'Accept-Language': 'tr',
      'Encoding': 'utf-8'
    });
    expect(headers.size).toStrictEqual(2);
    headers.clear();
    expect(headers.size).toStrictEqual(0);
  })

  it('Should delete() delete specified entry', async () => {
    const headers = new HttpHeaders();
    headers.append('Accept-Language', 'en');
    expect(headers.size).toStrictEqual(1);
    expect(headers.delete('Accept-Language')).toStrictEqual(true);
    expect(headers.size).toStrictEqual(0);
    expect(headers.delete('Accept-Language')).toStrictEqual(false);
  })

  it('Should toObject() return swallow copy of entries', async () => {
    const headers = new HttpHeaders();
    const obj = {
      'Accept-Language': 'tr',
      'Encoding': 'utf-8'
    };
    headers.appendAll(obj);
    expect(headers.toObject()).not.toBe(obj);
    expect(headers.toObject()).toStrictEqual(obj);
  })

  it('Should getProxy() return Proxy object', async () => {
    const headers = new HttpHeaders({
      'Accept-Language': 'tr',
      'Encoding': 'utf-8'
    });
    const proxy = headers.getProxy();
    expect(headers.toObject()).toStrictEqual({
      'Accept-Language': 'tr',
      'Encoding': 'utf-8'
    });
    proxy['content-type'] = 'application/json';
    expect(Object.keys(proxy)).toStrictEqual(['accept-language', 'encoding', 'content-type']);
    expect(headers.get('Content-Type')).toStrictEqual('application/json');
    delete proxy['content-type'];
    expect(headers.get('Content-Type')).toStrictEqual(undefined);
    expect(proxy.encoding).toStrictEqual('utf-8');
    headers.delete('encoding');
    expect(proxy.encoding).toStrictEqual(undefined);
  })


});
