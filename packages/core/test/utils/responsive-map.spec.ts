import 'reflect-metadata';
import { ResponsiveMap } from '../../src/utils/responsive-map.js';

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

  it('Should re store entry with string different case sensitivity', async () => {
    const map = new ResponsiveMap();
    map.set('key1', 1);
    expect(Array.from(map.keys())).toStrictEqual(['key1']);
    map.delete('KEY1');
    map.set('Key1', 1);
    expect(Array.from(map.keys())).toStrictEqual(['Key1']);
  })

});
