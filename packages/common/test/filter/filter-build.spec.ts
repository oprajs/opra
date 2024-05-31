import { OpraFilter } from '@opra/common';

const {
  $and,
  $arithmetic,
  $array,
  $date,
  $eq,
  $field,
  $gt,
  $gte,
  $ilike,
  $in,
  $like,
  $lt,
  $lte,
  $ne,
  $notILike,
  $notIn,
  $notLike,
  $number,
  $or,
  $paren,
  $time,
} = OpraFilter;

describe('Building Filter', function () {
  afterAll(() => global.gc && global.gc());

  it('Should $eq() create ComparisonExpression', () => {
    const x = $eq('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('=');
    expect(x.left.kind).toStrictEqual('StringLiteral');
    // @ts-ignore
    expect(x.left.value).toStrictEqual('a');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    // @ts-ignore
    expect(x.right.value).toStrictEqual(1);
    expect('' + x).toStrictEqual("'a'=1");
  });

  it('Should $gt() create ComparisonExpression', () => {
    const x = $gt('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('>');
  });

  it('Should $lt() create ComparisonExpression', () => {
    const x = $gte('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('>=');
  });

  it('Should $lt() create ComparisonExpression', () => {
    const x = $lt('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('<');
  });

  it('Should $lte() create ComparisonExpression', () => {
    const x = $lte('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('<=');
  });

  it('Should $eq() create ComparisonExpression', () => {
    const x = $ne('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('!=');
  });

  it('Should $in() create ComparisonExpression', () => {
    const x = $in('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('in');
  });

  it('Should $notIn() create ComparisonExpression', () => {
    const x = $notIn('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('!in');
  });

  it('Should $like() create ComparisonExpression', () => {
    const x = $like('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('like');
  });

  it('Should $notLike() create ComparisonExpression', () => {
    const x = $notLike('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('!like');
  });

  it('Should $ilike() create ComparisonExpression', () => {
    const x = $ilike('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('ilike');
  });

  it('Should $notILike() create ComparisonExpression', () => {
    const x = $notILike('a', 1);
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('!ilike');
  });

  it('Should $array() create ArrayExpression', () => {
    const x = $array('a', 2);
    expect(x.kind).toStrictEqual('ArrayExpression');
    expect(x.items.length).toStrictEqual(2);
    expect(x.items[0].kind).toStrictEqual('StringLiteral');
    expect(x.items[1].kind).toStrictEqual('NumberLiteral');
    expect('' + x).toStrictEqual("['a',2]");
  });

  it('Should $number() create NumberLiteral', () => {
    let x = $number('123');
    expect(x.kind).toStrictEqual('NumberLiteral');
    expect(x.value).toStrictEqual(123);
    expect('' + x).toStrictEqual('123');
    x = $number(123);
    expect(x.kind).toStrictEqual('NumberLiteral');
    expect(x.value).toStrictEqual(123);
    x = $number(BigInt('123'));
    expect(x.kind).toStrictEqual('NumberLiteral');
    expect(x.value).toStrictEqual(BigInt(123));
    x = $number('9007199254740992000000');
    expect(x.kind).toStrictEqual('NumberLiteral');
    expect(x.value).toStrictEqual(BigInt('9007199254740992000000'));
    expect(() => $number('abc')).toThrow('Invalid');
  });

  it('Should $date() create DateLiteral', () => {
    let x = $date('2020-03-12');
    expect(x.kind).toStrictEqual('DateLiteral');
    expect(x.value).toStrictEqual('2020-03-12');
    expect('' + x).toStrictEqual("'2020-03-12'");
    x = $date('2020-03-12T10:40:50.245');
    expect(x.kind).toStrictEqual('DateLiteral');
    expect(x.value).toStrictEqual('2020-03-12T10:40:50.245');
    expect(() => $date('2020:03:12')).toThrow('s not a valid date');
  });

  it('Should $time() create TimeLiteral', () => {
    let x = $time('14:40:03.123');
    expect(x.kind).toStrictEqual('TimeLiteral');
    expect(x.value).toStrictEqual('14:40:03.123');
    expect('' + x).toStrictEqual("'14:40:03.123'");
    x = $time('10:40');
    expect(x.kind).toStrictEqual('TimeLiteral');
    expect(x.value).toStrictEqual('10:40');
    expect(() => $time('25:50')).toThrow('Invalid');
  });

  it('Should $field() create QualifiedIdentifier', () => {
    let x = $field('name');
    expect(x.kind).toStrictEqual('QualifiedIdentifier');
    expect(x.value).toStrictEqual('name');
    expect('' + x).toStrictEqual('name');
    x = $field('Person.name');
    expect(x.kind).toStrictEqual('QualifiedIdentifier');
    expect(x.value).toStrictEqual('Person.name');
    expect('' + x).toStrictEqual('Person.name');
  });

  it('Should $arithmetic() create ArithmeticExpression', () => {
    let x = $arithmetic(1).add(2).sub(3).mul(4).div(5);
    expect(x.kind).toStrictEqual('ArithmeticExpression');
    expect(x.items.length).toStrictEqual(5);
    expect(x.items[0].op).toStrictEqual('+');
    expect(x.items[1].op).toStrictEqual('+');
    expect(x.items[2].op).toStrictEqual('-');
    expect(x.items[3].op).toStrictEqual('*');
    expect(x.items[4].op).toStrictEqual('/');
    expect('' + x).toStrictEqual('1+2-3*4/5');
    x = $arithmetic(1).add($arithmetic(3).mul(4));
    expect('' + x).toStrictEqual('1+3*4');
  });

  it('Should $paren() create ParenthesesExpression', () => {
    let x: OpraFilter.Expression = $paren($arithmetic(1).add(2));
    expect(x.kind).toStrictEqual('ParenthesizedExpression');
    expect('' + x).toStrictEqual('(1+2)');
    x = $arithmetic(1).add($paren($arithmetic(3).mul(4)));
    expect('' + x).toStrictEqual('1+(3*4)');
  });

  it('Should $and() create LogicalExpression', () => {
    const x = $and($eq($field('a'), 1), $eq($field('b'), 2));
    expect(x.kind).toStrictEqual('LogicalExpression');
    expect(x.op).toStrictEqual('and');
    expect(x.items.length).toStrictEqual(2);
    expect('' + x).toStrictEqual('a=1 and b=2');
  });

  it('Should $or() create LogicalExpression', () => {
    const x = $or($eq($field('a'), 1), $eq($field('b'), 2));
    expect(x.kind).toStrictEqual('LogicalExpression');
    expect(x.op).toStrictEqual('or');
    expect(x.items.length).toStrictEqual(2);
    expect('' + x).toStrictEqual('a=1 or b=2');
  });

  it('Should $parse() parse expression', () => {
    const x = OpraFilter.parse('a=1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
  });

  it('Should wrap entry values to Ast objects', () => {
    const d = new Date();
    const x = $array('a', 2, true, BigInt(10), d, null, [1, 2]);
    expect(x.kind).toStrictEqual('ArrayExpression');
    expect(x.items.length).toStrictEqual(7);
    expect(x.items[0].kind).toStrictEqual('StringLiteral');
    expect(x.items[1].kind).toStrictEqual('NumberLiteral');
    expect(x.items[2].kind).toStrictEqual('BooleanLiteral');
    expect(x.items[3].kind).toStrictEqual('NumberLiteral');
    expect(x.items[4].kind).toStrictEqual('DateLiteral');
    expect(x.items[5].kind).toStrictEqual('NullLiteral');
    expect(x.items[6].kind).toStrictEqual('ArrayExpression');
  });
});
