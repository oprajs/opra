import { ResponsiveMap } from '../src/responsive-map.js';

describe('ResponsiveMap', function () {

  it('Should store string and other keys', async () => {
    const map = new ResponsiveMap();
    const key = {};
    map.set('str', 1);
    map.set(key, 2);
    expect(map.get('str')).toStrictEqual(1);
    expect(map.get(key)).toStrictEqual(2);
  })

  it('Should get value with string key in case-insensitive way', async () => {
    const map = new ResponsiveMap();
    map.set('key1', 1);
    map.set('Key2', 2);
    expect(Array.from(map.keys())).toStrictEqual(['key1', 'Key2']);
    expect(map.get('key1')).toStrictEqual(1);
    expect(map.get('KEY1')).toStrictEqual(1);
    expect(map.get('key2')).toStrictEqual(2);
    expect(map.get('KEY2')).toStrictEqual(2);
  })

  it('Should delete entry with string key in case-insensitive way', async () => {
    const map = new ResponsiveMap();
    map.set('key1', 1);
    map.set('Key2', 2);
    expect(Array.from(map.keys())).toStrictEqual(['key1', 'Key2']);
    expect(map.get('key1')).toStrictEqual(1);
    map.delete('KEY1');
    expect(Array.from(map.keys())).toStrictEqual(['Key2']);
  })

  it('Should re-store entry with string different case sensitivity', async () => {
    const map = new ResponsiveMap();
    map.set('key1', 1);
    expect(Array.from(map.keys())).toStrictEqual(['key1']);
    map.delete('KEY1');
    map.set('Key1', 1);
    expect(Array.from(map.keys())).toStrictEqual(['Key1']);
  })

  it('Should use well-known keys', async () => {
    const map = new ResponsiveMap(undefined, ['Key1', 'Key2']);
    map.set('key1', 1);
    map.set('key2', 2);
    expect(Array.from(map.keys())).toStrictEqual(['Key1', 'Key2']);
  })

  it('Should iterate key by "set" order', async () => {
    const map = new ResponsiveMap();
    const keys = ['key2', 'key1', 'key5', 'key4', 'key3'];
    let i = 0;
    keys.forEach(k => map.set(k, i++));
    i = 0;
    for (const k of map.keys()) {
      expect(k).toStrictEqual(keys[i++]);
    }

    i = 0;
    for (const v of map.values()) {
      expect(v).toStrictEqual(i++);
    }

    i = 0;
    for (const [k, v] of map.entries()) {
      expect(k).toStrictEqual(keys[i]);
      expect(v).toStrictEqual(i++);
    }

    i = 0;
    for (const [k, v] of map) {
      expect(k).toStrictEqual(keys[i]);
      expect(v).toStrictEqual(i++);
    }
  })


  it('Should sort keys', async () => {
    const map = new ResponsiveMap();
    const keys = ['key2', 'key1', 'key5', 'key4', 'key3'];
    let i = 0;
    keys.forEach(k => map.set(k, i++));

    map.sort();
    keys.sort();

    i = 0;
    for (const k of map.keys()) {
      expect(k).toStrictEqual(keys[i++]);
    }
  })

});
