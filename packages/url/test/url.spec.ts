import {OwoURL} from '../src';

describe('OwoURL', function () {

  describe('Parse url string', () => {

    it('Should parse protocol', () => {
      let u = new OwoURL('http://anyuri.com/');
      expect(u.protocol).toStrictEqual('http:');
      u = new OwoURL('git-ssh://anyuri.com/');
      expect(u.protocol).toStrictEqual('git-ssh:');
    })

    it('Should parse hostname and port', () => {
      let u = new OwoURL('http://anyuri.com');
      expect(u.hostname).toStrictEqual('anyuri.com');
      expect(u.port).toStrictEqual(null);
      expect(u.href).toStrictEqual('http://anyuri.com');
      u = new OwoURL('http://anyuri.com:81/');
      expect(u.hostname).toStrictEqual('anyuri.com');
      expect(u.port).toStrictEqual(81);
      expect(u.href).toStrictEqual('http://anyuri.com:81');
    })

    it('Should parse auth part', () => {
      let u = new OwoURL('http://user@anyuri.com');
      expect(u.host).toStrictEqual('anyuri.com');
      expect(u.username).toStrictEqual('user');
      expect(u.password).toStrictEqual('');
      expect(u.href).toStrictEqual('http://user@anyuri.com');
      u = new OwoURL('http://user:pass@anyuri.com');
      expect(u.host).toStrictEqual('anyuri.com');
      expect(u.username).toStrictEqual('user');
      expect(u.password).toStrictEqual('pass');
      expect(u.href).toStrictEqual('http://user:pass@anyuri.com');
      u = new OwoURL('http://:pass@anyuri.com');
      expect(u.host).toStrictEqual('anyuri.com');
      expect(u.username).toStrictEqual('');
      expect(u.password).toStrictEqual('pass');
      expect(u.href).toStrictEqual('http://:pass@anyuri.com');
    })

    it('Should parse path', () => {
      const u = new OwoURL('https://anyuri.com/Person');
      expect(u.path.get(0)).toEqual({resource: 'Person'});
      expect(u.href).toStrictEqual('https://anyuri.com/Person');
    })

    it('Should parse path with resource key', () => {
      const u = new OwoURL('https://anyuri.com/Person|123');
      expect(u.path.get(0)).toEqual({resource: 'Person', key: '123'});
      expect(u.href).toStrictEqual('https://anyuri.com/Person|123');
    })

    it('Should parse path with named resource key', () => {
      const u = new OwoURL('https://anyuri.com/Person|id=123');
      expect(u.path.get(0)).toEqual({resource: 'Person', key: {id: '123'}});
      expect(u.href).toStrictEqual('https://anyuri.com/Person|id=123');
    })

    it('Should parse path with multiple named resource key', () => {
      const u = new OwoURL('https://anyuri.com/Person|mrn=123;y=2000');
      expect(u.path.get(0)).toEqual({resource: 'Person', key: {mrn: '123', y: '2000'}});
      expect(u.href).toStrictEqual('https://anyuri.com/Person|mrn=123;y=2000');
    })

    it('Should parse if resource key contains "=" char', () => {
      const u = new OwoURL('https://anyuri.com/Person|id=1=2');
      expect(u.path.get(0)).toEqual({resource: 'Person', key: {id: '1=2'}});
      expect(u.href).toStrictEqual('https://anyuri.com/Person|id="1=2"');
    })

    it('Should throw if mixing key:value keys and simple keys', () => {
      expect(() => new OwoURL('https://anyuri.com/Person|id=1;2')).toThrow('name:value pair required');
      expect(() => new OwoURL('https://anyuri.com/Person|1;id=1')).toThrow('name:value pair required');
      expect(() => new OwoURL('https://anyuri.com/Person|1;2')).toThrow('name:value pair required');
    })

    it('Should parse query part', () => {
      const u = new OwoURL('http://anyuri.com/?prm1=1&prm2=hello');
      expect(u.searchParams.get('prm1')).toStrictEqual('1');
      expect(u.searchParams.get('prm2')).toStrictEqual('hello');
      expect(u.search).toStrictEqual('?prm1=1&prm2=hello');
      expect(u.href).toStrictEqual('http://anyuri.com?prm1=1&prm2=hello');
    })

    it('Should parse query part with quoted strings', () => {
      const u = new OwoURL('http://anyuri.com/?prm1=\'a#b\'&prm2="hello&world" hi');
      expect(u.searchParams.get('prm1')).toStrictEqual('\'a#b\'');
      expect(u.searchParams.get('prm2')).toStrictEqual('"hello&world" hi');
      expect(u.search).toStrictEqual('?prm1=\'a#b\'&prm2="hello&world" hi');
      expect(u.href).toStrictEqual('http://anyuri.com?prm1=\'a#b\'&prm2="hello&world" hi');
    })

    it('Should parse query part with bracket chars', () => {
      const u = new OwoURL('http://anyuri.com/?prm1=(1#2) and "1&2"&prm2=[hello&world]');
      expect(u.searchParams.get('prm1')).toStrictEqual('(1#2) and "1&2"');
      expect(u.searchParams.get('prm2')).toStrictEqual('[hello&world]');
      expect(u.search).toStrictEqual('?prm1=(1#2) and "1&2"&prm2=[hello&world]');
      expect(u.href).toStrictEqual('http://anyuri.com?prm1=(1#2) and "1&2"&prm2=[hello&world]');
    })

    it('Should parse hash part', () => {
      const u = new OwoURL('http://anyuri.com/Person#h1#h2');
      expect(u.hash).toStrictEqual('#h1#h2');
      expect(u.href).toStrictEqual('http://anyuri.com/Person#h1#h2');
    })
  })

  describe('Url parts', () => {

    it('Should set protocol', () => {
      const u = new OwoURL();
      u.protocol = 'http';
      expect(u.protocol).toStrictEqual('http:');
      u.protocol = 'git-ssh';
      expect(u.protocol).toStrictEqual('git-ssh:');
      u.protocol = 'https:';
      expect(u.protocol).toStrictEqual('https:');
    })

    it('Should validate protocol', () => {
      const u = new OwoURL();
      expect(() => u.protocol = 'https:/').toThrow('Invalid');
    })

    it('Should set hostname', () => {
      const u = new OwoURL();
      u.hostname = 'www.anyurl.org';
      expect(u.hostname).toStrictEqual('www.anyurl.org');
    })

    it('Should validate hostname', () => {
      const u = new OwoURL();
      expect(() => u.hostname = 'anyurl/').toThrow('Invalid');
    })

    it('Should set port', () => {
      const u = new OwoURL();
      u.port = 1234;
      expect(u.port).toStrictEqual(1234);
    })

    it('Should validate port', () => {
      const u = new OwoURL();
      expect(() => u.port = -1).toThrow('Invalid');
      expect(() => u.port = 35536).toThrow('Invalid');
      expect(() => u.port = 1.2).toThrow('Invalid');
      expect(() => u.port = NaN).toThrow('Invalid');
    })

    it('Should set host', () => {
      const u = new OwoURL();
      u.host = 'www.anyurl.org:81';
      expect(u.hostname).toStrictEqual('www.anyurl.org');
      expect(u.port).toStrictEqual(81);
      u.host = 'www.otherurl.org';
      expect(u.hostname).toStrictEqual('www.otherurl.org');
      expect(u.port).toStrictEqual(null);
    })

    it('Should set prefix', () => {
      const u = new OwoURL();
      u.prefix = 'api/v1/';
      expect(u.prefix).toStrictEqual('api/v1');
      u.prefix = 'api/v1(a:"?")/';
      expect(u.prefix).toStrictEqual('api/v1(a:"?")');
    })

    it('Should normalize prefix', () => {
      const u = new OwoURL();
      u.prefix = 'api/v1/?a=1';
      expect(u.prefix).toStrictEqual('api/v1');
      u.prefix = 'api/v1#hash';
      expect(u.prefix).toStrictEqual('api/v1');
    })

    it('Should set pathname', () => {
      const u = new OwoURL();
      u.pathname = 'Person/addresses';
      expect(u.pathname).toStrictEqual('/Person/addresses');
    })

    it('Should setting pathname build path', () => {
      const u = new OwoURL();
      u.pathname = 'Person/addresses';
      expect(u.path.length).toStrictEqual(2);
      expect(u.path.get(0)).toEqual({resource: 'Person'});
      expect(u.path.get(1)).toEqual({resource: 'addresses'});
    })

    it('Should parse path key', () => {
      const u = new OwoURL();
      u.pathname = 'Person|1234';
      expect(u.path.get(0)).toEqual({resource: 'Person', key: '1234'});
    })

    it('Should always parse path key as string if value is quoted', () => {
      const u = new OwoURL();
      u.pathname = 'Person|"1234"';
      expect(u.path.get(0)).toEqual({resource: 'Person', key: '1234'});
    })

    it('Should parse path key (key:value pair)', () => {
      const u = new OwoURL();
      u.pathname = 'Person|a=1234;b="xyz"';
      expect(u.path.get(0)).toEqual({resource: 'Person', key: {a: '1234', b: 'xyz'}});
    })

    it('Should set hash', () => {
      const u = new OwoURL();
      u.hash = 'adsf#asdf';
      expect(u.hash).toStrictEqual('#adsf#asdf');
    })

  })

  describe('Manipulating path', () => {
    it('Should add resource', () => {
      const u = new OwoURL();
      u.path.add('Person');
      expect(u.path.get(0)).toEqual({resource: 'Person'});
      expect(u.pathname).toStrictEqual('/Person');
    })

    it('Should add resource and key', () => {
      const u = new OwoURL();
      u.path.add('Person', '1234');
      expect(u.path.get(0)).toEqual({resource: 'Person', key: '1234'});
      expect(u.path.toString()).toEqual('Person|1234');
      expect(u.pathname).toStrictEqual('/Person|1234')
    })

    it('Should add resource and object key', () => {
      const u = new OwoURL();
      u.path.add('Person', {a: '1234', b: 'xyz'});
      expect(u.path.get(0)).toEqual({resource: 'Person', key: {a: '1234', b: 'xyz'}});
      expect(u.path.toString()).toEqual('Person|a=1234;b=xyz');
      expect(u.pathname).toStrictEqual('/Person|a=1234;b=xyz')
    })
  })

  describe('Manipulating search parameters', () => {
    it('Should add empty search parameter', () => {
      const url = new OwoURL()
        .addSearchParam('prm1');
      expect(url.search).toStrictEqual('?prm1');
    })

    it('Should add number query parameter', () => {
      const url = new OwoURL()
        .addSearchParam('prm1', 123);
      if (!url.search) return;
      expect(url.search).toStrictEqual('?prm1=123');
    })

    it('Should add string query parameter', () => {
      const url = new OwoURL()
        .addSearchParam('prm1', 'abc');
      expect(url.search).toStrictEqual('?prm1=abc')
    })

    it('Should add same query parameter', () => {
      const url = new OwoURL()
        .addPath('Person')
        .addSearchParam('prm1', 123)
        .addSearchParam('prm1', 'abc');
      expect(url.search).toStrictEqual('?prm1=123&prm1=abc');
    })

  });

});

