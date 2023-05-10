import '@opra/core';
import { OpraFilter } from '@opra/common';
import * as sqb from '@sqb/builder';

export default function transformFilter(
    ast: OpraFilter.Expression | undefined
): any {
  if (!ast)
    return;

  if (ast instanceof OpraFilter.QualifiedIdentifier) {
    return sqb.Field(ast.value);
  }

  if (ast instanceof OpraFilter.NumberLiteral ||
      ast instanceof OpraFilter.StringLiteral ||
      ast instanceof OpraFilter.BooleanLiteral ||
      ast instanceof OpraFilter.NullLiteral ||
      ast instanceof OpraFilter.DateLiteral ||
      ast instanceof OpraFilter.TimeLiteral
  ) {
    return ast.value;
  }

  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(transformFilter);
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return sqb.Not(transformFilter(ast.expression));
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    if (ast.op === 'or')
      return sqb.Or(...ast.items.map(transformFilter));
    return sqb.And(...ast.items.map(transformFilter));
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return transformFilter(ast.expression);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = transformFilter(ast.left);
    const right = transformFilter(ast.right);
    switch (ast.op) {
      case '=':
        return sqb.Eq(left, right);
      case '!=':
        return sqb.Ne(left, right);
      case '>':
        return sqb.Gt(left, right);
      case '>=':
        return sqb.Gte(left, right);
      case '<':
        return sqb.Lt(left, right);
      case '<=':
        return sqb.Lte(left, right);
      case 'in':
        return sqb.In(left, right);
      case '!in':
        return sqb.Nin(left, right);
      case 'like':
        return sqb.Like(left, String(right).replace(/\*/, '%'));
      case 'ilike':
        return sqb.Ilike(left, String(right).replace(/\*/, '%'));
      case '!like':
        return sqb.NotLike(left, String(right).replace(/\*/, '%'));
      case '!ilike':
        return sqb.NotILike(left, String(right).replace(/\*/, '%'));
      default:
        throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
    }
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}
