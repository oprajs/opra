import '@opra/core';
import { OpraFilter } from '@opra/common';

const opMap = {
  '=': '$eq',
  '!=': '$ne',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
  'in': '$in',
  '!in': '$nin',
}

export default function transformFilter(
    ast: OpraFilter.Expression | undefined,
    negative?: boolean
): any {
  if (!ast)
    return;

  if (ast instanceof OpraFilter.QualifiedIdentifier) {
    return ast.value;
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
    return ast.items.map(x => transformFilter(x, negative));
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return transformFilter(ast.expression, !negative);
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    if (ast.op === 'or')
      return {$or: ast.items.map(x => transformFilter(x, negative))};
    return {$and: ast.items.map(x => transformFilter(x, negative))};
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return transformFilter(ast.expression, negative);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = transformFilter(ast.left, negative);

    if (ast.right instanceof OpraFilter.QualifiedIdentifier) {
      const op = opMap[ast.op];
      if (op)
        return {$expr: {[op]: ["$" + left, "$" + ast.right.value]}};
      /* istanbul ignore next */
      throw new Error(`Invalid filter query.`);
    }

    let right = transformFilter(ast.right);
    if (right == null) {
      const op = ast.op === '='
          ? (negative ? '!=' : '=')
          : (negative ? '=' : '!=');
      if (op === '=')
        return {$or: [{[left]: null}, {[left]: {$exists: false}}]};
      if (op === '!=')
        return {$and: [{$ne: {[left]: null}}, {[left]: {$exists: true}}]};
    }

    const mngOp = opMap[ast.op];
    if (mngOp) {
      if (ast.op === 'in' || ast.op === '!in')
        right = Array.isArray(right) ? right : [right];
      if (ast.op === '=' && !negative)
        return {[left]: right};
      return {[left]: wrapNot({[mngOp]: right}, negative)};
    }

    switch (ast.op) {
      case 'like':
        return {
          [left]:
              wrapNot({
                $text: {
                  $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
                  $caseSensitive: true
                }
              }, negative)
        };
      case 'ilike':
        return {
          [left]:
              wrapNot({
                $text: {
                  $search: '\\"' + right.replace(/\\"/, '"') + '\\"'
                }
              }, negative)
        };
      case '!like':
        return {
          [left]: wrapNot({
            $text: {
              $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
              $caseSensitive: true
            }
          }, !negative)
        }
      case '!ilike':
        return {
          [left]: wrapNot({
            $text: {
              $search: '\\"' + right.replace(/\\"/, '"') + '\\"'
            }
          }, !negative)
        };
    }

    throw new Error(`Unimplemented ComparisonExpression operation (right side is ${ast.right.kind})`);
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}

const wrapNot = (o: object, negative?: boolean) => negative ? {$not: o} : o;
