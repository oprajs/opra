import {ComparisonExpression, IntegerFormat, OpraURL} from '../src';

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
    expect(u.port).toStrictEqual(null);
    expect(u.href).toStrictEqual('http://anyuri.com');
    u = new OpraURL('http://anyuri.com:81/');
    expect(u.hostname).toStrictEqual('anyuri.com');
    expect(u.port).toStrictEqual(81);
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
    expect(u.searchParams.get('prm1')).toStrictEqual('1');
    expect(u.searchParams.get('prm2')).toStrictEqual('hello');
    expect(u.search).toStrictEqual('?prm1=1&prm2=hello');
    expect(u.href).toStrictEqual('http://anyuri.com?prm1=1&prm2=hello');
  })

  it('Should parse hash part', () => {
    const u = new OpraURL('http://anyuri.com/Person#h1#h2');
    expect(u.hash).toStrictEqual('#h1#h2');
    expect(u.href).toStrictEqual('http://anyuri.com/Person#h1#h2');
  })

  it('Should set parse "_filter" as Filter', () => {
    const u = new OpraURL('/Person?_filter=a=1');
    expect(u.searchParams.get('_filter')).toBeInstanceOf(ComparisonExpression);
  })

  it('Should set parse "_limit" as number', () => {
    const u = new OpraURL('/Person?_limit=10');
    expect(u.searchParams.get('_limit')).toStrictEqual(10);
  })

  it('Should set parse "_skip" as number', () => {
    const u = new OpraURL('/Person?_skip=2');
    expect(u.searchParams.get('_skip')).toStrictEqual(2);
  })

  it('Should set parse "_elements" as string', () => {
    const u = new OpraURL('/Person?_elements=id');
    expect(u.searchParams.get('_elements')).toStrictEqual('id');
  })

  it('Should set parse "_elements" as string array if has multiple values', () => {
    const u = new OpraURL('/Person?_elements=id,name,age');
    expect(u.searchParams.get('_elements')).toStrictEqual(['id', 'name', 'age']);
  })

  it('Should set parse "_exclude" as string', () => {
    const u = new OpraURL('/Person?_exclude=id');
    expect(u.searchParams.get('_exclude')).toStrictEqual('id');
  })

  it('Should set parse "_exclude" as string array if has multiple values', () => {
    const u = new OpraURL('/Person?_exclude=id,name,age');
    expect(u.searchParams.get('_exclude')).toStrictEqual(['id', 'name', 'age']);
  })

  it('Should set parse "_include" as string', () => {
    const u = new OpraURL('/Person?_include=id');
    expect(u.searchParams.get('_include')).toStrictEqual('id');
  })

  it('Should set parse "_include" as string array if has multiple values', () => {
    const u = new OpraURL('/Person?_include=id,name,age');
    expect(u.searchParams.get('_include')).toStrictEqual(['id', 'name', 'age']);
  })

  it('Should set parse "_distinct" as boolean', () => {
    let u = new OpraURL('/Person?_distinct');
    expect(u.searchParams.get('_distinct')).toStrictEqual(true);
    u = new OpraURL('/Person?_distinct=t');
    expect(u.searchParams.get('_distinct')).toStrictEqual(true);
    u = new OpraURL('/Person?_distinct=1');
    expect(u.searchParams.get('_distinct')).toStrictEqual(true);
    u = new OpraURL('/Person?_distinct=yes');
    expect(u.searchParams.get('_distinct')).toStrictEqual(true);
    u = new OpraURL('/Person?_distinct=y');
    expect(u.searchParams.get('_distinct')).toStrictEqual(true);
    u = new OpraURL('/Person?_distinct=false');
    expect(u.searchParams.get('_distinct')).toStrictEqual(false);
    u = new OpraURL('/Person?_distinct=f');
    expect(u.searchParams.get('_distinct')).toStrictEqual(false);
    u = new OpraURL('/Person?_distinct=0');
    expect(u.searchParams.get('_distinct')).toStrictEqual(false);
    u = new OpraURL('/Person?_distinct=n');
    expect(u.searchParams.get('_distinct')).toStrictEqual(false);
  })

  it('Should set parse "_total" as boolean', () => {
    let u = new OpraURL('/Person?_total');
    expect(u.searchParams.get('_total')).toStrictEqual(true);
    u = new OpraURL('/Person?_total=t');
    expect(u.searchParams.get('_total')).toStrictEqual(true);
    u = new OpraURL('/Person?_total=1');
    expect(u.searchParams.get('_total')).toStrictEqual(true);
    u = new OpraURL('/Person?_total=yes');
    expect(u.searchParams.get('_total')).toStrictEqual(true);
    u = new OpraURL('/Person?_total=y');
    expect(u.searchParams.get('_total')).toStrictEqual(true);
    u = new OpraURL('/Person?_total=false');
    expect(u.searchParams.get('_total')).toStrictEqual(false);
    u = new OpraURL('/Person?_total=f');
    expect(u.searchParams.get('_total')).toStrictEqual(false);
    u = new OpraURL('/Person?_total=0');
    expect(u.searchParams.get('_total')).toStrictEqual(false);
    u = new OpraURL('/Person?_total=n');
    expect(u.searchParams.get('_total')).toStrictEqual(false);
  })

  it('Should set register custom parameter', () => {
    const u = new OpraURL()
      .defineSearchParam('_prm1', {format: new IntegerFormat()})
      .parse('/Person?_prm1=5');
    expect(u.searchParams.get('_prm1')).toStrictEqual(5);
  })

  it('Should initialize with uri and pathPrefix', () => {
    const u = new OpraURL('http://anyuri.com/service', '/service');
    expect(u.pathPrefix).toStrictEqual('/service');
  })

  it('Should get origin', () => {
    const u = new OpraURL('http://anyuri.com:81/any/path');
    expect(u.origin).toStrictEqual('http://anyuri.com');
  })

});

