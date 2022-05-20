import {
  ArithmeticExpression,
  ArrayExpression,
  BooleanLiteral,
  ComparisonExpression,
  ComparisonOperator,
  DateLiteral,
  Expression,
  NullLiteral,
  NumberLiteral,
  ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral,
  TimeLiteral
} from './ast';
import {LogicalExpression} from './ast';

export type EntryValue = Expression | string | number | bigint | boolean | null | Date;
export type EntryValues = EntryValue | EntryValue[];

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

export function $number(v: string): NumberLiteral {
  return new NumberLiteral(v);
}

export function $array(...items: Expression[]): ArrayExpression {
  return new ArrayExpression(items);
}

export function $field(v: string): QualifiedIdentifier {
  return new QualifiedIdentifier(v);
}

export function $eq(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('=', left, right);
}

export function $ne(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('!=', left, right);
}

export function $gt(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('>', left, right);
}

export function $gte(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('>=', left, right);
}

export function $lt(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('<', left, right);
}

export function $lte(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('>=', left, right);
}

export function $in(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('in', left, right);
}

export function $notIin(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('!in', left, right);
}

export function $like(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('like', left, right);
}

export function $notLike(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('!like', left, right);
}

export function $ilike(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('ilike', left, right);
}

export function $notILike(left: EntryValues, right: EntryValues): ComparisonExpression {
  return comparisonExpression('!ilike', left, right);
}

export function $paren(expression: Expression): ParenthesesExpression {
  return new ParenthesesExpression(expression);
}

export function $math(n: EntryValue): MathExpression {
  const exp = new MathExpression();
  exp.addItem('+', wrapEntryValue(n));
  return exp;
}

/**
 *
 */
export class MathExpression extends ArithmeticExpression {
  add(expression: EntryValue): this {
    return this.addItem('+', _wrapEntryValue(expression));
  }

  sub(expression: EntryValue): this {
    return this.addItem('-', _wrapEntryValue(expression));
  }

  mul(expression: EntryValue): this {
    return this.addItem('*', _wrapEntryValue(expression));
  }

  div(expression: EntryValue): this {
    return this.addItem('/', _wrapEntryValue(expression));
  }

}

function comparisonExpression(
  op: ComparisonOperator,
  left: EntryValues,
  right: EntryValues,
): ComparisonExpression {
  const lex = wrapEntryValue(left);
  const rex = wrapEntryValue(right);
  return new ComparisonExpression({op, left: lex, right: rex});
}

const wrapEntryValue = (v: EntryValues): Expression => {
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
