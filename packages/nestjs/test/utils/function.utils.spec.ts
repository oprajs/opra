/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */
import { getNumberOfArguments } from '../../src/utils/function.utils.js';

describe('Utils - getNumberOfArguments', () => {
  describe('when using function', () => {
    it('should return 0 for a 0-argument function', () => {
      // @formatter:off
      function zeroArgFunction() {}
      // @formatter:on
      expect(getNumberOfArguments(zeroArgFunction)).toBe(0);
    });

    it('should return 1 for a 1-argument function', () => {
      // @formatter:off
      function oneArgFunction(_arg1: any) {}
      // @formatter:on
      expect(getNumberOfArguments(oneArgFunction)).toBe(1);
    });

    it('should return 2 for a 2-argument function', () => {
      // @formatter:off
      function twoArgFunction(_arg1: any, _arg2: any) {}
      // @formatter:on
      expect(getNumberOfArguments(twoArgFunction)).toBe(2);
    });

    it('should return 2 for a 2-argument function, even if it has a default parameter', () => {
      // @formatter:off
      function twoArgFunction(_arg1: any, _arg2 = 'text') {}
      expect(getNumberOfArguments(twoArgFunction)).toBe(2);
    });
  });

  describe('when using arrow function', () => {
    it('should return 0 for a 0-argument function', () => {
      // @formatter:off
      const zeroArgFunction = () => {};
      // @formatter:on
      expect(getNumberOfArguments(zeroArgFunction)).toBe(0);
    });

    it('should return 1 for a 1-argument function', () => {
      // @formatter:off
      const oneArgFunction = (_arg1: any) => {};
      // @formatter:on
      expect(getNumberOfArguments(oneArgFunction)).toBe(1);
    });

    it('should return 2 for a 2-argument function', () => {
      // @formatter:off
      const twoArgFunction = (_arg1: any, _arg2: any) => {};
      // @formatter:on
      expect(getNumberOfArguments(twoArgFunction)).toBe(2);
    });

    it('should return 2 for a 2-argument function, even if it has a default parameter', () => {
      // @formatter:off
      const twoArgFunction = (_arg1: any, _arg2 = 1) => {};
      // @formatter:on
      expect(getNumberOfArguments(twoArgFunction)).toBe(2);
    });
  });

  describe('when using class method', () => {
    // @formatter:off
    class TestClass {
      methodZeroArguments() {}

      methodOneArgument(_arg: any) {}

      methodTwoArguments(_arg1: any, _arg2: any) {}

      methodTwoArgumentsOneOptional(_arg1: any, _arg2 = ['raw']) {}
    }
    // @formatter:on

    const instance = new TestClass();

    it('should return 0 for a 0-argument function', () => {
      expect(getNumberOfArguments(instance.methodZeroArguments)).toBe(0);
    });

    it('should return 1 for a 1-argument function', () => {
      expect(getNumberOfArguments(instance.methodOneArgument)).toBe(1);
    });

    it('should return 2 for a 2-argument function', () => {
      expect(getNumberOfArguments(instance.methodTwoArguments)).toBe(2);
    });

    it('should return 2 for a 2-argument function, even if it has a default parameter', () => {
      expect(getNumberOfArguments(instance.methodTwoArgumentsOneOptional)).toBe(
          2,
      );
    });
  });

  describe('when using class static method', () => {
    // @formatter:off
    class TestStaticClass {
      static methodZeroArguments() {}

      static methodOneArgument(_arg: any) {}

      static methodTwoArguments(_arg1: any, _arg2: any) {}

      static methodTwoArgumentsOneOptional(_arg1: any, _arg2 = ['raw']) {}
    }
    // @formatter:on

    it('should return 0 for a 0-argument function', () => {
      expect(getNumberOfArguments(TestStaticClass.methodZeroArguments)).toBe(0);
    });

    it('should return 1 for a 1-argument function', () => {
      expect(getNumberOfArguments(TestStaticClass.methodOneArgument)).toBe(1);
    });

    it('should return 2 for a 2-argument function', () => {
      expect(getNumberOfArguments(TestStaticClass.methodTwoArguments)).toBe(2);
    });

    it('should return 2 for a 2-argument function, even if it has a default parameter', () => {
      expect(
          getNumberOfArguments(TestStaticClass.methodTwoArgumentsOneOptional),
      ).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should not count an "empty" argument when the function ends with a comma', () => {
      // @formatter:off
      // prettier-ignore
      function functionEndingWithComma(_arg1, _arg2,) {}
      // @formatter:on

      expect(getNumberOfArguments(functionEndingWithComma)).toBe(2);
    });

    it('should count correctly for multi-lined functions', () => {
      // @formatter:off
      // prettier-ignore
      function multiLineFunction(
        _arg1 = 1,
        _arg2 = 2,
        _arg3 = 3,
      ) {}
      // @formatter:on

      expect(getNumberOfArguments(multiLineFunction)).toBe(3);
    });

    it('should count correctly for functions containing arrays as default values', () => {
      // @formatter:off
      function functionWithArray(_arg1 = 1, _arg2 = [1, 2, 3]) {}
      // @formatter:on

      expect(getNumberOfArguments(functionWithArray)).toBe(2);
    });

    it('should count correctly for functions containing objects as default values', () => {
      // @formatter:off
      function functionWithArray(_arg1 = 1, _arg2 = { a: 1, b: 2 }) {}
      // @formatter:on

      expect(getNumberOfArguments(functionWithArray)).toBe(2);
    });

    it('should count correctly for functions containing both objects and arrays as default values', () => {
      // @formatter:off
      function functionWithArray(_arg1 = [1, 2, 3], _arg2 = { a: 1, b: 2 }) {}
      // @formatter:on

      expect(getNumberOfArguments(functionWithArray)).toBe(2);
    });
  });
});
