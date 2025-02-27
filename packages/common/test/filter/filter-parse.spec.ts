import { OpraFilter } from '@opra/common';

describe('Parse Filter', () => {
  afterAll(() => global.gc && global.gc());

  it('Should parse NumberLiteral', () => {
    let x = OpraFilter.parse('a=1');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    expect(x.right.value).toStrictEqual(1);
    x = OpraFilter.parse('a=-1');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    expect(x.right.value).toStrictEqual(-1);
  });

  it('Should parse StringLiteral', () => {
    const x = OpraFilter.parse('a="1"');
    expect(x.right.kind).toStrictEqual('StringLiteral');
    expect(x.right.value).toStrictEqual('1');
  });

  it('Should parse BooleanLiteral', () => {
    const x = OpraFilter.parse('a=true');
    expect(x.right.kind).toStrictEqual('BooleanLiteral');
    expect(x.right.value).toStrictEqual(true);
  });

  it('Should parse DateLiteral', () => {
    const x = OpraFilter.parse('a="2020-01-01"');
    expect(x.right.kind).toStrictEqual('DateLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01');
  });

  it('Should parse DateTimeLiteral', () => {
    let x = OpraFilter.parse('a="2020-01-01T10:30:00"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01T10:30:00');
    x = OpraFilter.parse('a="2020-01-01T10:30"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01T10:30');
    x = OpraFilter.parse('a="2020-01-01T10:30+03:00"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01T10:30+03:00');
    x = OpraFilter.parse('a="2020-01-01 10:30:00"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01 10:30:00');
    x = OpraFilter.parse('a="2020-01-01 10:30"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01 10:30');
    x = OpraFilter.parse('a="2020-01-01 10:30+03:00"');
    expect(x.right.kind).toStrictEqual('DateTimeLiteral');
    expect(x.right.value).toStrictEqual('2020-01-01 10:30+03:00');
  });

  it('Should parse Infinity', () => {
    let x = OpraFilter.parse('a=Infinity');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    expect(x.right.value).toStrictEqual(Infinity);
    x = OpraFilter.parse('a=infinity');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    expect(x.right.value).toStrictEqual(Infinity);
  });

  it('Should parse NullLiteral', () => {
    const x = OpraFilter.parse('a=null');
    expect(x.right.kind).toStrictEqual('NullLiteral');
    expect(x.right.value).toStrictEqual(null);
  });

  it('Should parse ArrayExpression', () => {
    const x = OpraFilter.parse('a=["1", 2]');
    expect(x.right.kind).toStrictEqual('ArrayExpression');
    expect(x.right.items.length).toStrictEqual(2);
    expect(x.right.items[0].kind).toEqual('StringLiteral');
    expect(x.right.items[0].value).toEqual('1');
    expect(x.right.items[1].kind).toEqual('NumberLiteral');
    expect(x.right.items[1].value).toEqual(2);
    expect('' + x).toStrictEqual(`a=['1',2]`);
  });

  it('Should parse (=) ComparisonExpression', () => {
    const x = OpraFilter.parse('a=1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('=');
    expect(x.left.kind).toStrictEqual('QualifiedIdentifier');
    expect(x.left.value).toStrictEqual('a');
    expect(x.right.kind).toStrictEqual('NumberLiteral');
    expect(x.right.value).toStrictEqual(1);
    expect('' + x).toStrictEqual('a=1');
  });

  it('Should parse (>) ComparisonExpression', () => {
    const x = OpraFilter.parse('a>1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('>');
  });

  it('Should parse (<) ComparisonExpression', () => {
    const x = OpraFilter.parse('a<1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('<');
  });

  it('Should parse (>=) ComparisonExpression', () => {
    const x = OpraFilter.parse('a>=1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('>=');
  });

  it('Should parse (<=) ComparisonExpression', () => {
    const x = OpraFilter.parse('a<=1');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('<=');
  });

  it('Should parse (in) ComparisonExpression', () => {
    const x = OpraFilter.parse('a in [1,2]');
    expect(x.kind).toStrictEqual('ComparisonExpression');
    expect(x.op).toStrictEqual('in');
  });
});
