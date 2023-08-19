import { OpraURL } from '../../src/index.js';

describe('OpraURL', () => {

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
    expect(u.path.length).toStrictEqual(1);
    expect(u.path[0].resource).toStrictEqual('Person');
    expect(u.pathname).toStrictEqual('/Person');
    expect(u.href).toStrictEqual('https://anyuri.com/Person');
  })

  it('Should parse path without domain', () => {
    const u = new OpraURL('/Person');
    expect(u.path.length).toStrictEqual(1);
    expect(u.path[0].resource).toStrictEqual('Person');
    expect(u.pathname).toStrictEqual('/Person');
    expect(u.href).toStrictEqual('/Person');
  })

  it('Should parse path (percent encoded resource)', () => {
    const u = new OpraURL('https://anyuri.com/Hello%20World@%22%20%22');
    expect(u.path[0].resource).toStrictEqual('Hello World');
    expect(u.path[0].key).toStrictEqual('" "');
    expect(u.href).toStrictEqual('https://anyuri.com/Hello%20World@%22%20%22');
  })

  it('Should parse path with resource key', () => {
    const u = new OpraURL('/Person@123');
    expect(u.path[0]).toMatchObject({resource: 'Person', key: 123});
    expect(u.href).toStrictEqual('/Person@123');
  })

  it('Should parse path with named resource key', () => {
    const u = new OpraURL('/Person@id=123');
    expect(u.path[0]).toMatchObject({resource: 'Person', key: {id: 123}});
    expect(u.href).toStrictEqual('/Person@id=123');
  })

  it('Should parse path with multiple named resource key', () => {
    const u = new OpraURL('/Person@mrn=123;y="2000"');
    expect(u.path[0]).toMatchObject({resource: 'Person', key: {mrn: 123, y: '2000'}});
    expect(u.href).toStrictEqual('/Person@mrn=123;y="2000"');
  })

  it('Should parse path with type casting', () => {
    const u = new OpraURL('/Person::CustomerPerson');
    expect(u.path[0]).toMatchObject({resource: 'Person', typeCast: 'CustomerPerson'});
    expect(u.href).toStrictEqual('/Person::CustomerPerson');
  })

  it('Should parse path with key and type casting', () => {
    const u = new OpraURL('/Person@1::CustomerPerson');
    expect(u.path[0]).toMatchObject({resource: 'Person', key: 1, typeCast: 'CustomerPerson'});
    expect(u.href).toStrictEqual('/Person@1::CustomerPerson');
  })

  it('Should throw if url is invalid', () => {
    expect(() => new OpraURL('Person@id=1;2')).toThrow('Invalid');
    expect(() => new OpraURL('http:Person@id=1;2')).toThrow('Invalid');
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
    u = new OpraURL('http://localhost:3001/svc1/#types[name=\'Address\']');
    expect(u.hash).toStrictEqual('#types[name=\'Address\']');
    expect(u.href).toStrictEqual('http://localhost:3001/svc1#types[name=\'Address\']');
  })

  it('Should initialize with base uri', () => {
    const u = new OpraURL('MyResource', 'https://user:pass@anyuri.com:81/service');
    expect(u.protocol).toStrictEqual('https:');
    expect(u.username).toStrictEqual('user');
    expect(u.password).toStrictEqual('pass');
    expect(u.hostname).toStrictEqual('anyuri.com');
    expect(u.port).toStrictEqual('81');
    expect(u.pathname).toStrictEqual('/service/MyResource');
  })

  it('Should get origin', () => {
    const u = new OpraURL('http://anyuri.com:81/any/path');
    expect(u.origin).toStrictEqual('http://anyuri.com');
  })

  it('Should set hostname', () => {
    const u = new OpraURL();
    u.hostname = 'www.anyuri.com';
    expect(u.href).toStrictEqual('http://www.anyuri.com');
    u.hostname = 'www.anyurl.org';
    expect(u.hostname).toStrictEqual('www.anyurl.org');
  })

  it('Should validate hostname', () => {
    const u = new OpraURL();
    expect(() => u.hostname = 'anyurl/').toThrow('Invalid');
  })

  it('Should set protocol', () => {
    const u = new OpraURL();
    u.protocol = 'http';
    expect(u.protocol).toStrictEqual('http:');
    u.protocol = 'git-ssh';
    expect(u.protocol).toStrictEqual('git-ssh:');
    u.protocol = 'https:';
    expect(u.protocol).toStrictEqual('https:');
    u.protocol = 'https';
    u.hostname = 'www.anyuri.com';
    expect(u.href).toStrictEqual('https://www.anyuri.com');
  })

  it('Should validate protocol', () => {
    const u = new OpraURL();
    expect(() => u.protocol = 'https:/').toThrow('Invalid');
  })

  it('Should set port', () => {
    const u = new OpraURL();
    u.hostname = 'www.anyuri.com';
    u.port = 81;
    expect(u.href).toStrictEqual('http://www.anyuri.com:81');
    u.port = '1234';
    expect(u.port).toStrictEqual('1234');
    u.port = '';
    expect(u.port).toStrictEqual('');
  })

  it('Should validate port', () => {
    const u = new OpraURL();
    expect(() => u.port = -1).toThrow('Invalid');
    expect(() => u.port = 65536).toThrow('Invalid');
  })

  it('Should set host', () => {
    const u = new OpraURL();
    u.host = 'www.anyuri.com:81';
    expect(u.href).toStrictEqual('http://www.anyuri.com:81');
    u.host = 'www.anyurl.org:82';
    expect(u.hostname).toStrictEqual('www.anyurl.org');
    expect(u.port).toStrictEqual('82');
    u.host = 'www.otherurl.org';
    expect(u.hostname).toStrictEqual('www.otherurl.org');
    expect(u.port).toStrictEqual('');
  })

  it('Should validate host', () => {
    const u = new OpraURL();
    expect(() => u.host = 'htp:invalidUrl').toThrow('Invalid host');
  })

  it('Should set pathname', () => {
    const u = new OpraURL();
    u.pathname = 'api/v1/Person';
    expect(u.href).toStrictEqual('/api/v1/Person');
    u.pathname = 'a b%20';
    expect(u.pathname).toStrictEqual('/a%20b%20');
  })

  it('Should add resource to path', () => {
    const u = new OpraURL()
        .join('Person')
        .join('address');
    expect(u.pathname).toStrictEqual('/Person/address');
  })

  it('Should set query', () => {
    const u = new OpraURL();
    u.search = 'prm1=true&prm2=2';
    expect(u.search).toStrictEqual('?prm1=true&prm2=2');
    expect(u.searchParams.toString()).toStrictEqual('prm1=true&prm2=2');
  })

  it('Should set hash', () => {
    const u = new OpraURL();
    u.hash = 'hash';
    u.hostname = 'www.anyuri.com';
    expect(u.href).toStrictEqual('http://www.anyuri.com#hash');
  })

})
