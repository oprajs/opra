import {escapeQuotes, quoted, unquoted} from '../src';

describe('String utils', function () {

  describe('escapeQuotes()', () => {
    it('Should escape single quote characters', () => {
      expect(escapeQuotes("abc'd")).toStrictEqual("abc''d");
    })
    it('Should escape double quote characters', () => {
      expect(escapeQuotes('abc"d')).toStrictEqual('abc""d');
    })
    it('Should escape mixed quote characters', () => {
      expect(escapeQuotes('ab\'c"d')).toStrictEqual('ab\'\'c""d');
    })
  })

  describe('quoted()', () => {
    it('Should escape single quote characters and return single quoted string', () => {
      expect(quoted("abc'd", "'")).toStrictEqual("'abc''d'");
    })
    it('Should double single quote characters and return single double string', () => {
      expect(quoted('abc"d', '"')).toStrictEqual('"abc""d"');
    })
    it('Should escape mixed quote characters and return single quoted string', () => {
      expect(quoted("abc'\"d", "'")).toStrictEqual("'abc''\"d'");
    })
    it('Should escape mixed quote characters and return double quoted string', () => {
      expect(quoted("ab'c\"d", '"')).toStrictEqual('"ab\'c""d"');
    })
  })

  describe('unquoted()', () => {
    it('Should unescape quotes in unquoted string', () => {
      expect(unquoted("abc''d")).toStrictEqual("abc'd");
      expect(unquoted('abc""d')).toStrictEqual('abc"d');
    })

    it('Should unescape quotes in quoted string', () => {
      expect(unquoted("'abc''d'")).toStrictEqual("abc'd");
      expect(unquoted('"abc""d"')).toStrictEqual('abc"d');
    })

    it('Should ignore different quotes in quoted string', () => {
      expect(unquoted("'abc\"\"d'")).toStrictEqual('abc""d');
      expect(unquoted('"abc\'\'d"')).toStrictEqual("abc''d");
    })
  });

});

