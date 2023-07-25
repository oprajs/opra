import { OpraURLPath } from '@opra/common';

describe('UrlPath', function () {

  it('Should parse simple path components', () => {
    const u = new OpraURLPath('r1/r2');
    expect(u.length).toStrictEqual(2);
    expect(u[0].resource).toStrictEqual('r1');
    expect(u[0].typeCast).toStrictEqual(undefined);
    expect(u[1].resource).toStrictEqual('r2');
    expect(u[1].typeCast).toStrictEqual(undefined);
  })

  it('Should parse "type cast" parts', () => {
    const u = new OpraURLPath('r1::R1/r2::R2');
    expect(u.length).toStrictEqual(2);
    expect(u[0].resource).toStrictEqual('r1');
    expect(u[0].typeCast).toStrictEqual('R1');
    expect(u[1].resource).toStrictEqual('r2');
    expect(u[1].typeCast).toStrictEqual('R2');
  })

  it('Should parse "key" part', () => {
    const u = new OpraURLPath('r1@1');
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
    expect(u[0].key).toStrictEqual(1);
  })

  it('Should parse object "key" part', () => {
    const u = new OpraURLPath('r1@id=1;active=true;gender="M"');
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
    expect(u[0].key).toStrictEqual({id: 1, active: true, gender: 'M'});
  })

  it('Should parser ignore leading separator', () => {
    const u = new OpraURLPath('/r1');
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
  })

  it('Should parser ignore leading dots', () => {
    let u = new OpraURLPath('./r1');
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
    u = new OpraURLPath('../r1');
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
  })

  it('Should init components with object', () => {
    const u = new OpraURLPath({resource: 'r1', key: 1});
    expect(u.length).toStrictEqual(1);
    expect(u[0].resource).toStrictEqual('r1');
    expect(u[0].key).toStrictEqual(1);
  })

  it('Should .resolve() resolve current path', () => {
    let u1 = new OpraURLPath('/r1');
    u1.resolve('r2');
    expect(u1.length).toStrictEqual(2);
    expect(u1[0].resource).toStrictEqual('r1');
    expect(u1[1].resource).toStrictEqual('r2');
    u1 = new OpraURLPath();
    u1.resolve(new OpraURLPath('/r1/r2'));
    expect(String(u1)).toStrictEqual('/r1/r2');
  })

  it('Should .resolve("..") move to parent', () => {
    let u1 = new OpraURLPath('/r1/r2/r3/r4');
    u1.resolve('..');
    expect(String(u1)).toEqual('/r1/r2/r3');
    u1 = new OpraURLPath('/r1/r2/r3/r4');
    u1.resolve('../../');
    expect(String(u1)).toEqual('/r1/r2');
    u1 = new OpraURLPath('/r1/r2/r3/r4');
    u1.resolve('..', '..');
    expect(String(u1)).toEqual('/r1/r2');
  })

  it('Should .join() join path', () => {
    const u1 = new OpraURLPath('/r1');
    u1.join('/r2/r3')
    expect(u1.length).toStrictEqual(3);
    expect(u1[0].resource).toStrictEqual('r1');
    expect(u1[1].resource).toStrictEqual('r2');
    expect(u1[2].resource).toStrictEqual('r3');
  })

  it('Should .resolve("/x") start from root', () => {
    let u1 = new OpraURLPath('/r1');
    u1.resolve('/r2', '/r3')
    expect(u1.length).toStrictEqual(1);
    expect(u1[0].resource).toStrictEqual('r3');
    u1 = new OpraURLPath('/r1');
    u1.resolve('/r2', 'r3')
    expect(u1.length).toStrictEqual(2);
    expect(u1[0].resource).toStrictEqual('r2');
    expect(u1[1].resource).toStrictEqual('r3');
  })

  it('Should .join("/x") return join paths', () => {
    const u1 = new OpraURLPath('/r1');
    u1.join('/r2', '/r3')
    expect(String(u1)).toStrictEqual('/r1/r2/r3');
  })

  it('Should .isRelativeTo() check if path relative to given basePath', () => {
    const curPath = new OpraURLPath('/r1/r2/r3/r4');
    expect(curPath.isRelativeTo('/r1/r2')).toEqual(true);
    expect(curPath.isRelativeTo('/r5')).toEqual(false);
  })

  it('Should serialize to string', () => {
    let u = new OpraURLPath('r1/r2');
    expect(String(u)).toStrictEqual('/r1/r2');
    u = new OpraURLPath('r1::R1');
    expect(String(u)).toStrictEqual('/r1::R1');
    u = new OpraURLPath('r1@1');
    expect(String(u)).toStrictEqual('/r1@1');
    u = new OpraURLPath('r1@a123');
    expect(String(u)).toStrictEqual('/r1@a123');
    u = new OpraURLPath('r1@a=1;b=true;c="abc"');
    expect(String(u)).toStrictEqual('/r1@a=1;b=true;c="abc"');
  })

  it('Should convert to Array', () => {
    const u = new OpraURLPath('r1/r2/r3/r4');
    const arr = Array.from(u);
    expect(arr.length).toStrictEqual(4);
    expect(arr[0].resource).toStrictEqual('r1');
    expect(arr[1].resource).toStrictEqual('r2');
    expect(arr[2].resource).toStrictEqual('r3');
    expect(arr[3].resource).toStrictEqual('r4');
  })

  it('Should static .join() create new joined path', () => {
    const u1 = OpraURLPath.join('/r1', '/r2/r3');
    expect(u1.length).toStrictEqual(3);
    expect(u1[0].resource).toStrictEqual('r1');
    expect(u1[1].resource).toStrictEqual('r2');
    expect(u1[2].resource).toStrictEqual('r3');
  })

  it('Should static .resolve() create new resolved path', () => {
    const u1 = OpraURLPath.resolve('/r1', '/r2/r3');
    expect(u1.length).toStrictEqual(2);
    expect(u1[0].resource).toStrictEqual('r2');
    expect(u1[1].resource).toStrictEqual('r3');
  })

  it('Should static .relative() create new path relative to basePath', () => {
    let u1 = OpraURLPath.relative('/r1/r2/r3', '/r1');
    expect(u1).toBeDefined();
    expect(u1!.length).toStrictEqual(2);
    expect(u1![0].resource).toStrictEqual('r2');
    expect(u1![1].resource).toStrictEqual('r3');
    u1 = OpraURLPath.relative('/r1/r2/r3', '/r5');
    expect(u1).not.toBeDefined();
  })

});
