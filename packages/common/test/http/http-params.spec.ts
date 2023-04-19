import { HttpParams } from '@opra/common';

describe('HttpParams', function () {

  it('Should parse query part', () => {
    const u = new HttpParams('prm1&prm2=1');
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1&prm2=1');
  })

  it('Should append entry', () => {
    const u = new HttpParams();
    u.append('prm1');
    u.append('prm2', 1);
    u.append('prm2', 2);
    expect(u.size).toStrictEqual(3);
    expect(u.toString()).toStrictEqual('prm1&prm2=1&prm2=2');
  })

  it('Should set entry', () => {
    const u = new HttpParams();
    u.append('prm1');
    expect(u.size).toStrictEqual(1);
    u.append('prm1', 2);
    expect(u.size).toStrictEqual(2);
    u.append('prm1', 3);
    expect(u.size).toStrictEqual(3);
    u.append('prm2', 1);
    expect(u.size).toStrictEqual(4);
    u.set('prm1', 1);
    u.set('prm2', 2);
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1=1&prm2=2');
  })

  it('Should parse array parameters', () => {
    const u = new HttpParams();
    u.define('prm1', {array: true});
    u.appendAll('prm1=a%26b');
    expect(u.get('prm1')).toStrictEqual("a&b");
    u.clear();
    u.appendAll('prm1=a%26b,a%23b');
    expect(u.get('prm1')).toStrictEqual(["a&b", "a#b"]);
    expect(u.toString()).toStrictEqual('prm1=a%26b,a%23b');
    u.clear();
    u.appendAll('prm1=a,\'a,b\'');
    expect(u.get('prm1')).toStrictEqual(["a", "a,b"]);
    expect(u.toString()).toStrictEqual('prm1=a,a%2Cb');
  })

  it('Should parse strict array parameters', () => {
    const u = new HttpParams();
    u.define('prm1', {array: 'strict'});
    u.appendAll('prm1=a');
    expect(u.get('prm1')).toStrictEqual(["a"]);
    u.clear();
    u.appendAll('prm1=a,b');
    expect(u.get('prm1')).toStrictEqual(["a", "b"]);
  })

  it('Should validate minArrayItems', () => {
    const u = new HttpParams();
    u.define('prm1', {array: 'strict', minArrayItems: 2});
    expect(() => u.appendAll('prm1=a')).toThrow('at least');
  })

  it('Should validate maxArrayItems', () => {
    const u = new HttpParams();
    u.define('prm1', {array: 'strict', maxArrayItems: 2});
    expect(() => u.appendAll('prm1=a,b,c')).toThrow('up to');
  })

  it('Should set array delimiter', () => {
    const u = new HttpParams('prm1=a|b', {
      params: {
        prm1: {array: 'strict', arrayDelimiter: '|'}
      }
    });
    expect(u.get('prm1')).toStrictEqual(["a", "b"]);
  })

  it('Should stringify to percent encoded', () => {
    const u = new HttpParams();
    u.set('prm1', 'a#b');
    expect(u.toString()).toStrictEqual('prm1=a%23b');
    u.set('prm1', ['a&b', 'a#b']);
    expect(u.toString()).toStrictEqual('prm1=a%26b,a%23b');
  })

  it('Should clear', () => {
    const u = new HttpParams();
    u.append('prm1');
    u.append('prm1', 2);
    u.append('prm1', 3);
    u.append('prm2', 1);
    u.clear();
    expect(u.size).toStrictEqual(0);
    expect(u.toString()).toStrictEqual('');
  })

  it('Should delete entry', () => {
    const u = new HttpParams();
    u.append('prm1');
    u.append('prm1', 2);
    u.append('prm2', 1);
    u.append('prm2', 3);
    u.delete('prm2');
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1&prm1=2');
  })

  it('Should get entry value', () => {
    const u = new HttpParams();
    u.append('prm1', 1);
    u.append('prm1', 2);
    expect(u.get('prm1')).toStrictEqual(1);
    expect(u.get('prm1', 1)).toStrictEqual(2);
  })

  it('Should get all entry values', () => {
    const u = new HttpParams();
    u.append('prm1', 1);
    u.append('prm1', 2);
    expect(u.getAll('prm1')).toStrictEqual([1, 2]);
  })

  it('Should getAll return null if no entry found', () => {
    const u = new HttpParams();
    expect(u.getAll('prm1')).toStrictEqual(null);
  })

  it('Should check if entry exists using has()', () => {
    const u = new HttpParams();
    u.append('prm1', 1);
    expect(u.has('prm1')).toStrictEqual(true);
    expect(u.has('prm2')).toStrictEqual(false);
  })

  it('Should sort entries', () => {
    const u = new HttpParams();
    u.append('prm3');
    u.append('prm2');
    u.append('prm1');
    u.append('prm4');
    expect(u.toString()).toStrictEqual('prm3&prm2&prm1&prm4');
    u.sort();
    expect(u.toString()).toStrictEqual('prm1&prm2&prm3&prm4');
  })

  it('Should iterate entries using "forEach()"', () => {
    const entries: any[][] = [['prm1', ''], ['prm1', 2], ['prm1', 3], ['prm2', 1]];
    const u = new HttpParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    u.forEach((value, name) => {
      expect(name).toStrictEqual(entries[i][0]);
      expect(value).toStrictEqual(entries[i][1]);
      i++;
    })
  })

  it('Should iterate entries', () => {
    const entries: any[][] = [['prm1', ''], ['prm1', 2], ['prm1', 3], ['prm2', 1]];
    const u = new HttpParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const [key, value] of u) {
      expect(key).toStrictEqual(entries[i][0]);
      expect(value).toStrictEqual(entries[i][1]);
      i++;
    }
  })

  it('Should iterate entries using "entries()"', () => {
    const entries: any[][] = [['prm1', ''], ['prm1', 2], ['prm1', 3], ['prm2', 1]];
    const u = new HttpParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const [key, value] of u.entries()) {
      expect(key).toStrictEqual(entries[i][0]);
      expect(value).toStrictEqual(entries[i][1]);
      i++;
    }
  })

  it('Should iterate keys', () => {
    const entries: any[][] = [['prm1', ''], ['prm2', 2], ['prm3', 3], ['prm4', 1]];
    const u = new HttpParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const value of u.keys()) {
      expect(value).toStrictEqual(entries[i][0]);
      i++;
    }
  })

  it('Should encode', () => {
    const u = new HttpParams();
    u.define('prm3', {array: true})
    u.append('prm1');
    u.append('prm2', 'x y z');
    u.append('prm2', '+123');
    u.append('prm3', ['a', 'a,b']);
    expect(u.size).toStrictEqual(4);
    expect(u.toString()).toStrictEqual('prm1&prm2=x%20y%20z&prm2=%2B123&prm3=a,a%2Cb');
  })

  it('Should getProxy() return Proxy object', async () => {
    const headers = new HttpParams({
      'prm1': 'x',
      'prm2': ['y'],
      'prm3': [1, 'x', 'y'],
    });
    const proxy = headers.getProxy();
    expect(proxy).toMatchObject({
      'prm1': 'x',
      'prm2': ['y'],
      'prm3': [1, 'x', 'y'],
    });
    proxy.prm4 = 'z';
    expect(proxy).toMatchObject({
      'prm1': 'x',
      'prm2': ['y'],
      'prm3': [1, 'x', 'y'],
      'prm4': 'z',
    });
    delete proxy.prm4;
    expect(proxy).toMatchObject({
      'prm1': 'x',
      'prm2': ['y'],
      'prm3': [1, 'x', 'y'],
    });
  })

});
