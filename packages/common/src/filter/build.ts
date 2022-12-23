import {
  ArithmeticExpression,
  ArrayExpression,
  BooleanLiteral,
  ComparisonExpression,
  ComparisonOperator,
  DateLiteral,
  Expression,
  LogicalExpression,
  NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral,
  TimeLiteral
} from './ast/index.js';

type _EntryValue = Expression | string | number | bigint | boolean | null | Date;
export type EntryValue = _EntryValue | _EntryValue[];

export function $or(...items: Expression[]): LogicalExpression {
  return new LogicalExpression({op: 'or', items});
}

export function $and(...items: Expression[]): LogicalExpression {
  return new LogicalExpression({op: 'and', items});
}

export function $date(v: string): DateLiteral {
  return new DateLiteral(v);
}

export function $time(v: string): TimeLiteral {
  return new TimeLiteral(v);
}

export function $number(v: string | number | bigint): NumberLiteral {
  return new NumberLiteral(v);
}

export function $array(...items: EntryValue[]): ArrayExpression {
  return new ArrayExpression(items.map(wrapEntryValue));
}

export function $field(v: string): QualifiedIdentifier {
  return new QualifiedIdentifier(v);
}

export function $eq(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('=', left, right);
}

export function $ne(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('!=', left, right);
}

export function $gt(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('>', left, right);
}

export function $gte(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('>=', left, right);
}

export function $lt(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('<', left, right);
}

export function $lte(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('<=', left, right);
}

export function $in(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('in', left, right);
}

export function $notIn(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('!in', left, right);
}

export function $like(left: EntryValue, right: EntryValue): ComparisonExpression {
  return comparisonExpression('like', left, right);
}

export function $notLike(left: _EntryValue, right: _EntryValue): ComparisonExpression {
  return comparisonExpression('!like', left, right);
}

export function $ilike(left: _EntryValue, right: _EntryValue): ComparisonExpression {
  return comparisonExpression('ilike', left, right);
}

export function $notILike(left: _EntryValue, right: _EntryValue): ComparisonExpression {
  return comparisonExpression('!ilike', left, right);
}

export function $paren(expression: Expression): ParenthesesExpression {
  return new ParenthesesExpression(expression);
}

type MathExpression = ArithmeticExpression & {
  add(expression: EntryValue): MathExpression;
  sub(expression: EntryValue): MathExpression;
  mul(expression: EntryValue): MathExpression;
  div(expression: EntryValue): MathExpression;
}

export function $arithmetic(n: EntryValue): MathExpression {
  const exp = new ArithmeticExpression() as any;
  exp.add = (expression: EntryValue): MathExpression => {
    exp.append('+', _wrapEntryValue(expression));
    return exp;
  }
  exp.sub = (expression: EntryValue): MathExpression => {
    exp.append('-', _wrapEntryValue(expression));
    return exp;
  }
  exp.mul = (expression: EntryValue): MathExpression => {
    exp.append('*', _wrapEntryValue(expression));
    return exp;
  }
  exp.div = (expression: EntryValue): MathExpression => {
    exp.append('/', _wrapEntryValue(expression));
    return exp;
  }
  exp.append('+', wrapEntryValue(n));
  return exp;
}


function comparisonExpression(
    op: ComparisonOperator,
    left: EntryValue,
    right: EntryValue,
): ComparisonExpression {
  const lex = wrapEntryValue(left);
  const rex = wrapEntryValue(right);
  return new ComparisonExpression({op, left: lex, right: rex});
}

const wrapEntryValue = (v: EntryValue): Expression => {
  return Array.isArray(v)
      ? $array(...v.map(_wrapEntryValue))
      : _wrapEntryValue(v);
}

const _wrapEntryValue = (v: EntryValue): Expression => {
  if (v instanceof Expression)
    return v;
  if (typeof v === 'boolean')
    return new BooleanLiteral(v);
  if (typeof v === 'number' || typeof v === 'bigint')
    return new NumberLiteral(v);
  if (v == null)
    return new NullLiteral();
  if (v instanceof Date)
    return new DateLiteral(v);
  return new StringLiteral('' + v);
}
