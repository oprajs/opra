import {
  BooleanLiteral,
  DateLiteral, NullLiteral, NumberLiteral,
  parseFilter, TimeLiteral
} from '../src/index.js';

describe('Parsing Filter', function () {

  describe('parse terms', () => {

    it('Should parse BooleanLiteral', () => {
      let x = parseFilter('true');
      expect(x.kind).toStrictEqual('BooleanLiteral');
      expect(x.value).toStrictEqual(true);
      expect('' + x).toStrictEqual('true');
      x = parseFilter('false');
      expect(x.kind).toStrictEqual('BooleanLiteral');
      expect(x.value).toStrictEqual(false);
      expect(new BooleanLiteral(false).value).toStrictEqual(false);
    })

    it('Should parse NullLiteral', () => {
      const x = parseFilter('null');
      expect(x.kind).toStrictEqual('NullLiteral');
      expect(x.value).toStrictEqual(null);
      expect('' + x).toStrictEqual('null');
      expect(new NullLiteral().value).toStrictEqual(null);
    })

    it('Should parse NumberLiteral', () => {
      let x = parseFilter('-1.2');
      expect(x.kind).toStrictEqual('NumberLiteral');
      expect(x.value).toStrictEqual(-1.2);
      expect('' + x).toStrictEqual('-1.2');
      x = parseFilter('1');
      expect(x.kind).toStrictEqual('NumberLiteral');
      expect(x.value).toStrictEqual(1);
      expect('' + x).toStrictEqual('1');
      x = parseFilter('9007199254740992000000');
      expect(x.kind).toStrictEqual('NumberLiteral');
      expect(x.value).toStrictEqual(BigInt('9007199254740992000000'));
      expect('' + x).toStrictEqual('9007199254740992000000');
      expect(new NumberLiteral(1234).value).toStrictEqual(1234);
      expect(new NumberLiteral(BigInt(1234)).value).toStrictEqual(BigInt(1234));
      expect(() => new NumberLiteral('Not a valid number')).toThrow('Invalid number');
    })

    it('Should parse infinity as NumberLiteral', () => {
      let x = parseFilter('infinity');
      expect(x.kind).toStrictEqual('NumberLiteral');
      expect(x.value).toStrictEqual(Infinity);
      expect('' + x).toStrictEqual('Infinity');
      x = parseFilter('Infinity');
      expect(x.kind).toStrictEqual('NumberLiteral');
      expect(x.value).toStrictEqual(Infinity);
      expect('' + x).toStrictEqual('Infinity');
    })

    it('Should parse StringLiteral', () => {
      let x = parseFilter('"1"');
      expect(x.kind).toStrictEqual('StringLiteral');
      expect(x.value).toStrictEqual('1');
      expect('' + x).toStrictEqual("'1'");
      x = parseFilter('\'1\'');
      expect(x.kind).toStrictEqual('StringLiteral');
      expect(x.value).toStrictEqual('1');
    })

    it('Should parse DateLiteral', () => {
      let x = parseFilter('"2022-06-21"');
      expect(x.kind).toStrictEqual('DateLiteral');
      expect(x.value).toStrictEqual('2022-06-21');
      expect('' + x).toStrictEqual("'2022-06-21'");
      x = parseFilter('"2022-06-21T10:30:15Z"');
      expect(x.kind).toStrictEqual('DateLiteral');
      expect(x.value).toStrictEqual('2022-06-21T10:30:15Z');
      const d = new Date();
      x = new DateLiteral(d);
      expect(x.value).toStrictEqual(d.toISOString());
      expect(() => new DateLiteral('Not a valid date')).toThrow('Invalid date');
    })

    it('Should parse TimeLiteral', () => {
      let x = parseFilter('"10:45"');
      expect(x.kind).toStrictEqual('TimeLiteral');
      expect(x.value).toStrictEqual('10:45');
      expect('' + x).toStrictEqual("'10:45'");
      x = parseFilter('"10:45:00.123"');
      expect(x.kind).toStrictEqual('TimeLiteral');
      expect(x.value).toStrictEqual('10:45:00.123');
      x = new TimeLiteral(new Date('2000-01-01T09:32:55'));
      expect(x.value).toStrictEqual('09:32:55');
      expect(() => new TimeLiteral('Not a valid date')).toThrow('Invalid time');
    })

    it('Should parse QualifiedIdentifier', () => {
      const x = parseFilter('arg1');
      expect(x.kind).toStrictEqual('QualifiedIdentifier');
      expect(x.value).toStrictEqual('arg1');
      expect('' + x).toStrictEqual('arg1');
    })

    it('Should parse ExternalConstant', () => {
      const x = parseFilter('@arg1');
      expect(x.kind).toStrictEqual('ExternalConstant');
      expect(x.value).toStrictEqual('arg1');
      expect('' + x).toStrictEqual('@arg1');
    })

  })

  describe('parse expressions', () => {

    it('Should parse ArithmeticExpression', () => {
      const f = parseFilter('1*2/5');
      expect(f.kind).toStrictEqual('ArithmeticExpression');
      expect(Array.isArray(f.items)).toStrictEqual(true);
      expect(f.items.length).toStrictEqual(3);
      expect(f.items[0].op).toStrictEqual('*');
      expect(f.items[0].expression.kind).toStrictEqual('NumberLiteral');
      expect(f.items[0].expression.value).toStrictEqual(1);
      expect(f.items[1].op).toStrictEqual('*');
      expect(f.items[1].expression.kind).toStrictEqual('NumberLiteral');
      expect(f.items[1].expression.value).toStrictEqual(2);
      expect(f.items[2].op).toStrictEqual('/');
      expect(f.items[2].expression.kind).toStrictEqual('NumberLiteral');
      expect(f.items[2].expression.value).toStrictEqual(5);
      expect('' + f).toStrictEqual('1*2/5');
    })

    it('Should parse ParenthesesExpression', () => {
      let f = parseFilter('(1 * 2)');
      expect(f.kind).toStrictEqual('ParenthesesExpression');
      expect(f.expression.kind).toStrictEqual('ArithmeticExpression');
      expect('' + f).toStrictEqual('(1*2)');
      f = parseFilter('a = 1 and (c = 2 or c = 4)');
      expect('' + f).toStrictEqual('a=1 and (c=2 or c=4)');
    })

    it('Should parse ArrayExpression', () => {
      const f = parseFilter('[1, "2"]');
      expect(f.kind).toStrictEqual('ArrayExpression');
      expect(Array.isArray(f.items)).toStrictEqual(true);
      expect(f.items.length).toStrictEqual(2);
      expect(f.items[0].kind).toStrictEqual('NumberLiteral');
      expect(f.items[0].value).toStrictEqual(1);
      expect(f.items[1].kind).toStrictEqual('StringLiteral');
      expect(f.items[1].value).toStrictEqual('2');
      expect('' + f).toStrictEqual("[1,'2']");
    })

    it('Should parse ComparisonExpression', () => {
      let f = parseFilter('a=1');
      expect(f.kind).toStrictEqual('ComparisonExpression');
      expect(f.op).toStrictEqual('=');
      expect(typeof f.left).toStrictEqual('object');
      expect(f.left.kind).toStrictEqual('QualifiedIdentifier');
      expect(f.left.value).toStrictEqual('a');
      expect(typeof f.right).toStrictEqual('object');
      expect(f.right.kind).toStrictEqual('NumberLiteral');
      expect(f.right.value).toStrictEqual(1);
      expect('' + f).toStrictEqual('a=1');
      f = parseFilter('a != 1');
      expect('' + f).toStrictEqual('a!=1');
      f = parseFilter('a != 1');
      expect('' + f).toStrictEqual('a!=1');
      f = parseFilter('a > 1');
      expect('' + f).toStrictEqual('a>1');
      f = parseFilter('a < 1');
      expect('' + f).toStrictEqual('a<1');
      f = parseFilter('a >= 1');
      expect('' + f).toStrictEqual('a>=1');
      f = parseFilter('a <= 1');
      expect('' + f).toStrictEqual('a<=1');
    })

    it('Should parse LogicalExpression', () => {
      let f = parseFilter('a=1 and b="2" and c=3');
      expect(f.kind).toStrictEqual('LogicalExpression');
      expect(f.op).toStrictEqual('and');
      expect(Array.isArray(f.items)).toStrictEqual(true);
      expect(f.items.length).toStrictEqual(3);
      expect(f.items[0].kind).toStrictEqual('ComparisonExpression');
      expect(f.items[1].kind).toStrictEqual('ComparisonExpression');
      expect(f.items[2].kind).toStrictEqual('ComparisonExpression');
      expect('' + f).toStrictEqual("a=1 and b='2' and c=3");
      f = parseFilter('a=1 or b="2" or c=3');
      expect('' + f).toStrictEqual("a=1 or b='2' or c=3");
      f = parseFilter('a=1 or b="2" and c=3');
      expect('' + f).toStrictEqual("a=1 or b='2' and c=3");
    })

    it('Should parse ParenthesesExpression', () => {
      const f = parseFilter('a=(1 + 2)');
      expect(f.right.kind).toStrictEqual('ParenthesesExpression');
      expect(f.right.expression.kind).toStrictEqual('ArithmeticExpression');
      expect('' + f).toStrictEqual('a=(1+2)');
    })

    it('Should throw error that contains "errors:FilterParseError[]"', () => {
      try {
        parseFilter('!invalid')
      } catch (e: any) {
        expect(e.errors).toBeDefined();
        expect(e.errors[0].line).toBeDefined();
        expect(e.errors[0].charPositionInLine).toBeDefined();
      }
    })

  })

});

