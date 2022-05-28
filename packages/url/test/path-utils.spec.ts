import {decodePathComponent, encodePathComponent, joinPath, normalizePath} from '../src';

describe('Path utils', function () {

  describe('joinPath()', () => {

    it('Should join paths', () => {
      expect(joinPath('Person', 'address')).toStrictEqual('Person/address');
      expect(joinPath('root', '/Person', '/address')).toStrictEqual('root/Person/address');
    })

    it('Should join paths with leading slash', () => {
      expect(joinPath('/Person', 'address')).toStrictEqual('/Person/address');
      expect(joinPath('/root', '/Person', '/address')).toStrictEqual('/root/Person/address');
    })

    it('Should normalize', () => {
      expect(joinPath('/Person', 'address/')).toStrictEqual('/Person/address');
      expect(joinPath('/root', '/Person/', '/address/')).toStrictEqual('/root/Person/address');
    })

  })

  describe('normalizePath()', () => {

    it('Should remove trailing slashes', () => {
      expect(normalizePath('/Person/address/')).toStrictEqual('/Person/address');
    })

    it('Should not remove leading slashes if noLeadingSlash set to true', () => {
      expect(normalizePath('/Person/address/', true)).toStrictEqual('Person/address');
    })

    it('Should return empty string if empty or null value given', () => {
      expect(normalizePath('')).toStrictEqual('');
    })

  })


  describe('decodePathComponent()', () => {
    it('Should decode path component', () => {
      expect(decodePathComponent('Person')).toEqual({resource: 'Person'});
    })

    it('Should decode path component with key', () => {
      expect(decodePathComponent('Person@abc')).toEqual({resource: 'Person', key: 'abc'});
    })

    it('Should decode path component with object key', () => {
      expect(decodePathComponent('Person@a=1;b=2')).toEqual({resource: 'Person', key: {a: '1', b: '2'}});
    })

    it('Should decode percent encoded value', () => {
      expect(decodePathComponent('Person@' + encodeURIComponent('a&b&c')))
        .toEqual({resource: 'Person', key: 'a&b&c'});
    })

    it('Should validate', () => {
      expect(() => decodePathComponent('/Person@a')).toThrow('Invalid');
    })
  })

  describe('encodePathComponent()', () => {

    it('Should encode number key', () => {
      expect(encodePathComponent('123')).toStrictEqual('123');
    })

    it('Should encode string key', () => {
      expect(encodePathComponent('abc')).toStrictEqual('abc');
    })

    it('Should return percent encoded string', () => {
      expect(encodePathComponent('ab c')).toStrictEqual('ab%20c');
      expect(encodePathComponent('ab"c')).toStrictEqual('ab%22c');
      expect(encodePathComponent('abc=')).toStrictEqual('abc%3D');
      expect(encodePathComponent('abc;')).toStrictEqual('abc%3B');
    })

    it('Should encode object value', () => {
      expect(encodePathComponent('Person', {a: '1', b: 'abc'})).toStrictEqual('Person@a=1;b=abc');
    })

  })

});

