import {
  ArrayExpression,
  BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression, parseFilter,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/common';

export default function transformFilter(str: string | Expression | undefined): any {
  const ast = typeof str === 'string' ? parseFilter(str) : str;
  if (!ast)
    return;

  if (ast instanceof ComparisonExpression) {
    const left = ast.left instanceof QualifiedIdentifier
        ? ast.left.value
        : transformFilter(ast.left);
    const right = transformFilter(ast.right);

    switch (ast.op) {
      case '=':
        return {[left]: right};
      case '!=':
        return {[left]: {$ne: right}};
      case '>':
        return {[left]: {$gt: right}};
      case '>=':
        return {[left]: {$gte: right}};
      case '<':
        return {[left]: {$lt: right}};
      case '<=':
        return {[left]: {$lte: right}};
      case 'in':
        return {[left]: {$in: Array.isArray(right) ? right : [right]}};
      case '!in':
        return {[left]: {$nin: Array.isArray(right) ? right : [right]}};
      case 'like':
        return {
          [left]:
              {
                $text: {
                  $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
                  $caseSensitive: true
                }
              }
        };
      case 'ilike':
        return {
          [left]:
              {
                $text: {
                  $search: '\\"' + right.replace(/\\"/, '"') + '\\"'
                }
              }
        };
      case '!like':
        return {
          [left]: {
            $not: {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
                $caseSensitive: true
              }
            }
          }
        }
      case '!ilike':
        return {
          [left]: {
            $not: {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"'
              }
            }
          }
        };
      default:
        throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
    }
  }

  if (ast instanceof QualifiedIdentifier) {
    return ast.value;
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
    return ast.items.map(transformFilter);
  }

  if (ast instanceof LogicalExpression) {
    if (ast.op === 'or')
      return {$or: ast.items.map(transformFilter)};
    return {$and: ast.items.map(transformFilter)};
  }

  if (ast instanceof ParenthesesExpression) {
    return transformFilter(ast.expression);
  }

  throw new Error(`${ast.type} is not implemented yet`);
}
