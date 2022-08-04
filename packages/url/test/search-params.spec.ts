import { OpraURLSearchParams } from '../src';

describe('OpraURLSearchParams', function () {

  it('Should parse query part', () => {
    const u = new OpraURLSearchParams();
    u.parse('prm1&prm2=1');
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1&prm2=1');
  })

  it('Should append entry', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1');
    u.append('prm2', 1);
    u.append('prm2', 2);
    expect(u.size).toStrictEqual(3);
    expect(u.toString()).toStrictEqual('prm1&prm2=1&prm2=2');
  })

  it('Should set entry', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1');
    u.append('prm1', 2);
    u.append('prm1', 3);
    u.append('prm2', 1);
    u.set('prm1', 1);
    u.set('prm2', 2);
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1=1&prm2=2');
  })

  it('Should parse array parameters', () => {
    const u = new OpraURLSearchParams();
    u.defineParam('prm1', {array: true});
    u.parse('prm1=a%26b');
    expect(u.get('prm1')).toStrictEqual("a&b");
    u.parse('prm1=a%26b,a%23b');
    expect(u.get('prm1')).toStrictEqual(["a&b", "a#b"]);
    expect(u.toString()).toStrictEqual('prm1=a%26b,a%23b');
    u.parse('prm1=a,\'a,b\'');
    expect(u.get('prm1')).toStrictEqual(["a", "a,b"]);
    expect(u.toString()).toStrictEqual('prm1=a,\'a,b\'');
  })

  it('Should parse strict array parameters', () => {
    const u = new OpraURLSearchParams();
    u.defineParam('prm1', {array: 'strict'});
    u.parse('prm1=a');
    expect(u.get('prm1')).toStrictEqual(["a"]);
    u.parse('prm1=a,b');
    expect(u.get('prm1')).toStrictEqual(["a", "b"]);
  })

  it('Should validate minArrayItems', () => {
    const u = new OpraURLSearchParams();
    u.defineParam('prm1', {array: 'strict', minArrayItems: 2});
    expect(() => u.parse('prm1=a')).toThrow('at least');
  })

  it('Should validate maxArrayItems', () => {
    const u = new OpraURLSearchParams();
    u.defineParam('prm1', {array: 'strict', maxArrayItems: 2});
    expect(() => u.parse('prm1=a,b,c')).toThrow('up to');
  })

  it('Should set array delimiter', () => {
    const u = new OpraURLSearchParams();
    u.defineParam('prm1', {array: 'strict', arrayDelimiter: '|'});
    u.parse('prm1=a|b');
    expect(u.get('prm1')).toStrictEqual(["a", "b"]);
  })

  it('Should stringify to percent encoded', () => {
    const u = new OpraURLSearchParams();
    u.set('prm1', 'a#b');
    expect(u.toString()).toStrictEqual('prm1=a%23b');
    u.set('prm1', ['a&b', 'a#b']);
    expect(u.toString()).toStrictEqual('prm1=a%26b,a%23b');
  })

  it('Should clear', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1');
    u.append('prm1', 2);
    u.append('prm1', 3);
    u.append('prm2', 1);
    u.clear();
    expect(u.size).toStrictEqual(0);
    expect(u.toString()).toStrictEqual('');
  })

  it('Should delete entry', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1');
    u.append('prm1', 2);
    u.append('prm2', 1);
    u.append('prm2', 3);
    u.delete('prm2');
    expect(u.size).toStrictEqual(2);
    expect(u.toString()).toStrictEqual('prm1&prm1=2');
  })

  it('Should get entry value', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1', 1);
    u.append('prm1', 2);
    expect(u.get('prm1')).toStrictEqual(1);
    expect(u.get('prm1', 1)).toStrictEqual(2);
  })

  it('Should get all entry values', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1', 1);
    u.append('prm1', 2);
    expect(u.getAll('prm1')).toStrictEqual([1, 2]);
  })

  it('Should getAll return empty array if no entry found', () => {
    const u = new OpraURLSearchParams();
    expect(u.getAll('prm1')).toStrictEqual([]);
  })

  it('Should check if entry exists using has()', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1', 1);
    expect(u.has('prm1')).toStrictEqual(true);
    expect(u.has('prm2')).toStrictEqual(false);
  })

  it('Should sort entries', () => {
    const u = new OpraURLSearchParams();
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
    const u = new OpraURLSearchParams();
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
    const u = new OpraURLSearchParams();
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
    const u = new OpraURLSearchParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const [key, value] of u.entries()) {
      expect(key).toStrictEqual(entries[i][0]);
      expect(value).toStrictEqual(entries[i][1]);
      i++;
    }
  })

  it('Should iterate values', () => {
    const entries: any[][] = [['prm1', ''], ['prm1', 2], ['prm1', 3], ['prm2', 1]];
    const u = new OpraURLSearchParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const value of u.values()) {
      expect(value).toStrictEqual(entries[i][1]);
      i++;
    }
  })

  it('Should iterate keys', () => {
    const entries: any[][] = [['prm1', ''], ['prm2', 2], ['prm3', 3], ['prm4', 1]];
    const u = new OpraURLSearchParams();
    entries.forEach(x => u.append(x[0], x[1]));
    let i = 0;
    for (const value of u.keys()) {
      expect(value).toStrictEqual(entries[i][0]);
      i++;
    }
  })

  it('Should stringify', () => {
    const u = new OpraURLSearchParams();
    u.append('prm1');
    u.append('prm2', 'x y z');
    u.append('prm2', '+123');
    expect(u.size).toStrictEqual(3);
    expect(u.toString()).toStrictEqual('prm1&prm2=x y z&prm2=+123');
  })

});

