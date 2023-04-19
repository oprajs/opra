import { OpraURL } from '../../src/index.js';

describe('Parse url string', () => {

  it('Should parse protocol', () => {
    let u = new OpraURL('http://anyuri.com/');
    expect(u.protocol).toStrictEqual('http:');
    u = new OpraURL('git-ssh://anyuri.com/');
    expect(u.protocol).toStrictEqual('git-ssh:');
  })

  it('Should parse hostname and port', () => {
    let u = new OpraURL('http://anyuri.com');
    expect(u.hostname).toStrictEqual('anyuri.com');
    expect(u.port).toStrictEqual('');
    expect(u.href).toStrictEqual('http://anyuri.com');
    u = new OpraURL('http://anyuri.com:81/');
    expect(u.hostname).toStrictEqual('anyuri.com');
    expect(u.port).toStrictEqual('81');
    expect(u.href).toStrictEqual('http://anyuri.com:81');
  })

  it('Should parse auth part', () => {
    let u = new OpraURL('http://user@anyuri.com');
    expect(u.host).toStrictEqual('anyuri.com');
    expect(u.username).toStrictEqual('user');
    expect(u.password).toStrictEqual('');
    expect(u.href).toStrictEqual('http://user@anyuri.com');
    u = new OpraURL('http://user:pass@anyuri.com');
    expect(u.host).toStrictEqual('anyuri.com');
    expect(u.username).toStrictEqual('user');
    expect(u.password).toStrictEqual('pass');
    expect(u.href).toStrictEqual('http://user:pass@anyuri.com');
    u = new OpraURL('http://:pass@anyuri.com');
    expect(u.host).toStrictEqual('anyuri.com');
    expect(u.username).toStrictEqual('');
    expect(u.password).toStrictEqual('pass');
    expect(u.href).toStrictEqual('http://:pass@anyuri.com');
  })

  it('Should parse path', () => {
    const u = new OpraURL('https://anyuri.com/Person');
    expect(u.path.get(0)).toEqual({resource: 'Person'});
    expect(u.href).toStrictEqual('https://anyuri.com/Person');
  })

  it('Should parse path without domain', () => {
    const u = new OpraURL('/Person');
    expect(u.path.get(0)).toEqual({resource: 'Person'});
    expect(u.pathname).toStrictEqual('/Person');
    expect(u.href).toStrictEqual('/Person');
  })

  it('Should parse path (percent encoded resource)', () => {
    const u = new OpraURL('https://anyuri.com/Hello%20World@%22%20%22');
    expect(u.path.get(0)).toEqual({resource: 'Hello World', key: '" "'});
    expect(u.href).toStrictEqual('https://anyuri.com/Hello%20World@%22%20%22');
  })

  it('Should parse path with resource key', () => {
    const u = new OpraURL('/Person@123');
    expect(u.path.get(0)).toEqual({resource: 'Person', key: '123'});
    expect(u.href).toStrictEqual('/Person@123');
  })

  it('Should parse path with named resource key', () => {
    const u = new OpraURL('/Person@id=123');
    expect(u.path.get(0)).toEqual({resource: 'Person', key: {id: '123'}});
    expect(u.href).toStrictEqual('/Person@id=123');
  })

  it('Should parse path with multiple named resource key', () => {
    const u = new OpraURL('/Person@mrn=123;y=2000');
    expect(u.path.get(0)).toEqual({resource: 'Person', key: {mrn: '123', y: '2000'}});
    expect(u.href).toStrictEqual('/Person@mrn=123;y=2000');
  })

  it('Should parse if resource key contains special chars', () => {
    const u = new OpraURL('/Person@id=' + encodeURIComponent('abc=/\\?# x'));
    expect(u.path.get(0)).toEqual({resource: 'Person', key: {id: 'abc=/\\?# x'}});
    expect(u.href).toStrictEqual('/Person@id=' + encodeURIComponent('abc=/\\?# x'));
  })

  it('Should parse path with type casting', () => {
    const u = new OpraURL('/Person::CustomerPerson');
    expect(u.path.get(0)).toEqual({resource: 'Person', typeCast: 'CustomerPerson'});
    expect(u.href).toStrictEqual('/Person::CustomerPerson');
  })

  it('Should parse path with key and type casting', () => {
    const u = new OpraURL('/Person@1::CustomerPerson');
    expect(u.path.get(0)).toEqual({resource: 'Person', key: '1', typeCast: 'CustomerPerson'});
    expect(u.href).toStrictEqual('/Person@1::CustomerPerson');
  })

  it('Should throw if url is invalid', () => {
    expect(() => new OpraURL('Person@id=1;2')).toThrow('Invalid URL');
    expect(() => new OpraURL('http:Person@id=1;2')).toThrow('Invalid URL');
  })

  it('Should throw if mixing key:value keys and simple keys', () => {
    expect(() => new OpraURL('/Person@id=1;2')).toThrow('name:value pair required');
    expect(() => new OpraURL('/Person@1;id=1')).toThrow('name:value pair required');
    expect(() => new OpraURL('/Person@1;2')).toThrow('name:value pair required');
  })

  it('Should parse query part', () => {
    const u = new OpraURL('http://anyuri.com/?prm1=1&prm2=hello');
    expect(u.search).toStrictEqual('?prm1=1&prm2=hello');
    expect(u.searchParams.toString()).toStrictEqual('prm1=1&prm2=hello');
    expect(u.href).toStrictEqual('http://anyuri.com?prm1=1&prm2=hello');
  })

  it('Should parse hash part', () => {
    let u = new OpraURL('http://anyuri.com/Person#h1#h2');
    expect(u.hash).toStrictEqual('#h1#h2');
    expect(u.href).toStrictEqual('http://anyuri.com/Person#h1#h2');
    u = new OpraURL('http://localhost:3001/svc1/$metadata#types[name=\'Address\']');
    expect(u.hash).toStrictEqual('#types[name=\'Address\']');
    expect(u.href).toStrictEqual('http://localhost:3001/svc1/$metadata#types[name=\'Address\']');
  })

  it('Should initialize with base uri and prefix', () => {
    const u = new OpraURL('MyResource', 'https://anyuri.com/service');
    expect(u.protocol).toStrictEqual('https:');
    expect(u.hostname).toStrictEqual('anyuri.com');
    expect(u.prefix).toStrictEqual('/service');
    expect(u.pathname).toStrictEqual('/MyResource');
  })

  it('Should get origin', () => {
    const u = new OpraURL('http://anyuri.com:81/any/path');
    expect(u.origin).toStrictEqual('http://anyuri.com');
  })

});

