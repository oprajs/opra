import {
  ArrayExpression,
  BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  parseFilter,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/common';
import * as sqb from '@sqb/builder';

export function convertFilter(str: string | Expression | undefined): any {
  const ast = typeof str === 'string' ? parseFilter(str) : str;
  if (!ast)
    return;

  if (ast instanceof ComparisonExpression) {
    const left = ast.left instanceof QualifiedIdentifier
        ? ast.left.value : convertFilter(ast.left);
    const right = convertFilter(ast.right);

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
        return sqb.Like(left, right);
      case 'ilike':
        return sqb.Ilike(left, right);
      case '!like':
        return sqb.NotLike(left, right);
      case '!ilike':
        return sqb.NotILike(left, right);
      default:
        throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
    }
  }
  if (ast instanceof QualifiedIdentifier) {
    return sqb.Field(ast.value);
  }
  if (ast instanceof NumberLiteral ||
      ast instanceof StringLiteral ||
      ast instanceof BooleanLiteral ||
      ast instanceof NullLiteral ||
      ast instanceof DateLiteral ||
      ast instanceof TimeLiteral
  ) {
    return ast.value;
  }
  if (ast instanceof ArrayExpression) {
    return ast.items.map(convertFilter);
  }
  if (ast instanceof LogicalExpression) {
    if (ast.op === 'or')
      return sqb.Or(...ast.items.map(convertFilter));
    return sqb.And(...ast.items.map(convertFilter));
  }
  if (ast instanceof ArrayExpression) {
    return ast.items.map(convertFilter);
  }
  if (ast instanceof ParenthesesExpression) {
    return convertFilter(ast.expression);
  }
  throw new Error(`${ast.type} is not implemented yet`);
}
