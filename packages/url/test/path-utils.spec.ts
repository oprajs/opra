import {encodePathComponent} from '../src';

describe('Path utils', function () {

  describe('encodePathKey', () => {

    it('Should encode number key', () => {
      expect(encodePathComponent('123')).toStrictEqual('123');
    })

    it('Should encode string key', () => {
      expect(encodePathComponent('abc')).toStrictEqual('abc');
    })

    it('Should return empty string if value is null or undefined', () => {
      expect(encodePathComponent(null)).toStrictEqual('');
      expect(encodePathComponent(undefined)).toStrictEqual('');
    })

    it('Should return quoted string if value does not match simple pattern', () => {
      expect(encodePathComponent('ab c')).toStrictEqual('"ab c"');
      expect(encodePathComponent('ab+c')).toStrictEqual('"ab+c"');
      expect(encodePathComponent('abc:')).toStrictEqual('"abc:"');
    })

    it('Should encode object value', () => {
      expect(encodePathComponent('Person', {a: '1', b: 'abc'})).toStrictEqual('Person|a=1;b=abc');
    })

  })

});

