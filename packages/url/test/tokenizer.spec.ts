import {splitString, tokenize} from '../src/utils/tokenizer';

describe('Tokenizer', function () {

  describe('tokenize', function () {

    it('Should iterate tokens', () => {
      const tokenizer = tokenize(' /Hello world. This is mars');
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world');
      expect(tokenizer.next()).toStrictEqual('This');
      expect(tokenizer.next()).toStrictEqual('is');
      expect(tokenizer.next()).toStrictEqual('mars');
    })

    it('Should iterate empty tokens if emptyTokens=true', () => {
      const tokenizer = tokenize(' /Hello world. This is mars', {emptyTokens: true});
      expect(tokenizer.next()).toStrictEqual('');
      expect(tokenizer.next()).toStrictEqual('');
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world');
      expect(tokenizer.next()).toStrictEqual('');
      expect(tokenizer.next()).toStrictEqual('This');
      expect(tokenizer.next()).toStrictEqual('is');
      expect(tokenizer.next()).toStrictEqual('mars');
    })

    it('Should iterate tokens and delimiters if keepDelimiters=true', () => {
      const tokenizer = tokenize('/Hello world. This is mars', {keepDelimiters: true});
      expect(tokenizer.next()).toStrictEqual('/Hello');
      expect(tokenizer.next()).toStrictEqual(' world');
      expect(tokenizer.next()).toStrictEqual('.');
      expect(tokenizer.next()).toStrictEqual(' This');
      expect(tokenizer.next()).toStrictEqual(' is');
      expect(tokenizer.next()).toStrictEqual(' mars');
    })

    it('Should iterate tokens and delimiters if keepDelimiters=function', () => {
      const tokenizer = tokenize('/Hello world. This is mars', {keepDelimiters: (c) => c === ' '});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual(' world');
      expect(tokenizer.next()).toStrictEqual(' This');
      expect(tokenizer.next()).toStrictEqual(' is');
      expect(tokenizer.next()).toStrictEqual(' mars');
    })

    it('Should set token delimiters', () => {
      const tokenizer = tokenize('Hello world. This is mars', {delimiters: '.'});
      expect(tokenizer.next()).toStrictEqual('Hello world');
      expect(tokenizer.next()).toStrictEqual(' This is mars');
    })

    it('Should set token delimiters (RegExp)', () => {
      const tokenizer = tokenize('One1Two2Three3', {delimiters: /\d/});
      expect(tokenizer.next()).toStrictEqual('One');
      expect(tokenizer.next()).toStrictEqual('Two');
      expect(tokenizer.next()).toStrictEqual('Three');
    })

    it('Should return all chars in quotes as token', () => {
      const tokenizer = tokenize('Hello "world." `This is mars`', {quotes: true});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('"world."');
      expect(tokenizer.next()).toStrictEqual('`This is mars`');
    })

    it('Should not keep quote characters if keepQuotes=false', () => {
      const tokenizer = tokenize('Hello "world." `This is mars`', {quotes: true, keepQuotes: false});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world.');
      expect(tokenizer.next()).toStrictEqual('This is mars');
    })

    it('Should keep quote characters if keepQuotes=function', () => {
      const tokenizer = tokenize('Hello "world." `This is mars`', {quotes: true, keepQuotes: (c) => c === '`'});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world.');
      expect(tokenizer.next()).toStrictEqual('`This is mars`');
    })

    it('Should set quote characters', () => {
      const tokenizer = tokenize('Hello "world." `This is mars`', {delimiters: ' ', quotes: '`', keepQuotes: false});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('"world."');
      expect(tokenizer.next()).toStrictEqual('This is mars');
    })

    it('Should return all chars in brackets as token', () => {
      const tokenizer = tokenize('Hello (world. [This is] mars)', {brackets: true});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('(world. [This is] mars)');
    })

    it('Should keep bracket characters if keepBrackets=false', () => {
      const tokenizer = tokenize('Hello (world. [This is] mars)', {brackets: true, keepBrackets: false});
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world. This is mars');
    })

    it('Should keep bracket characters if keepBrackets=function', () => {
      const tokenizer = tokenize('Hello (world. [This is] mars)', {
        brackets: true,
        keepBrackets: (c) => c === '[' || c === ']'
      });
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world. [This is] mars');
    })

    it('Should escape', () => {
      const tokenizer = tokenize('Hello\\ world. This is mars');
      expect(tokenizer.next()).toStrictEqual('Hello world');
      expect(tokenizer.next()).toStrictEqual('This');
      expect(tokenizer.next()).toStrictEqual('is');
      expect(tokenizer.next()).toStrictEqual('mars');
    })

    it('Should escape using RegExp', () => {
      const tokenizer = tokenize('Hello# world. This is mars', {escape: /[#]/});
      expect(tokenizer.next()).toStrictEqual('Hello world');
      expect(tokenizer.next()).toStrictEqual('This');
      expect(tokenizer.next()).toStrictEqual('is');
      expect(tokenizer.next()).toStrictEqual('mars');
    })

    it('Should escape using function', () => {
      const tokenizer = tokenize("John''s place", {
        quotes: true,
        escape: (current, prev, next) => current === "'" && next === "'"
      });
      expect(tokenizer.next()).toStrictEqual('John\'s');
      expect(tokenizer.next()).toStrictEqual('place');
    })

    it('Should implement IterableIterator', () => {
      const tokenizer = tokenize('Hello world. This is mars');
      const arr = ['Hello', 'world', 'This', 'is', 'mars'];
      for (const s of tokenizer) {
        expect(s).toStrictEqual(arr.shift());
      }
    })

    it('Should return all tokens as string array', () => {
      const tokens = tokenize(' /Hello world. This is mars').all();
      expect(tokens).toStrictEqual(['Hello', 'world', 'This', 'is', 'mars']);
    })

    it('Should return one token if no delimiters exists', () => {
      const tokenizer = tokenize('Hello');
      expect(tokenizer.next()).toStrictEqual('Hello');
    })

    it('Should get current token', () => {
      const tokenizer = tokenize('Hello world. This is mars');
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.current).toStrictEqual('Hello');
    })

    it('Should get current index and start index of current token', () => {
      const tokenizer = tokenize('Hello world. This is mars');
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world');
      expect(tokenizer.current).toStrictEqual('world');
      expect(tokenizer.startIndex).toStrictEqual(6);
      expect(tokenizer.curIndex).toStrictEqual(11);
    })

    it('Should reset', () => {
      const tokenizer = tokenize('Hello world. This is mars');
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world');
      tokenizer.reset();
      expect(tokenizer.next()).toStrictEqual('Hello');
      expect(tokenizer.next()).toStrictEqual('world');
    })

  })

  describe('splitString', function () {

    it('Should split token parts as string array', () => {
      const tokens = splitString('Hello/world/This/is/mars');
      expect(tokens).toStrictEqual(['Hello', 'world', 'This', 'is', 'mars']);
    })

    it('Should array starts with empty items if string starts with a delimiter', () => {
      const tokens = splitString('/Hello/world/This/is/mars');
      expect(tokens).toStrictEqual(['', 'Hello', 'world', 'This', 'is', 'mars']);
    })
  });

});

