import '@opra/core';
import { OpraFilter } from '@opra/common';

export default function transformFilter(
    ast: OpraFilter.Expression | undefined
): any {
  if (!ast)
    return;

  return {query: _transformAst(ast)};
}

function _transformAst(ast: OpraFilter.Expression, negative?: boolean): any {

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
    return ast.items.map(x => _transformAst(x, negative));
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return _transformAst(ast.expression, !negative);
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    const v = ast.items.map(x => _transformAst(x));
    if (ast.op === 'and') {
      return {
        'bool': {
          [(negative ? 'must_not' : 'must')]: v
        }
      }
    }
    return wrapNot({
      'bool': {'should': v}
    }, negative)
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return _transformAst(ast.expression, negative);
  }

  if (ast instanceof OpraFilter.ComparisonExpression)
    return _transformComparisonExpression(ast, !!negative);

  throw new Error(`${ast.kind} is not implemented yet`);
}

function _transformComparisonExpression(
    ast: OpraFilter.ComparisonExpression,
    negative: boolean
): any {
  const left = _transformAst(ast.left, negative);

  if (ast.right instanceof OpraFilter.QualifiedIdentifier) {
    throw new TypeError('not implemented yet')
  }

  const right = _transformAst(ast.right);

  if (right == null) {
    const op = ast.op === '='
        ? (negative ? '!=' : '=')
        : (negative ? '=' : '!=');
    if (op === '=')
      return {'bool': {'must_not': {'exists': {'field': left}}}};
    if (op === '!=')
      return {'bool': {'exists': {'field': left}}};
  }

  switch (ast.op) {
    case '=':
      return wrapNot({'term': {[left]: right}}, negative);
    case '!=':
      return wrapNot({'term': {[left]: right}}, !negative);
    case '>':
      return wrapNot({'range': {[left]: {'gt': right}}}, negative);
    case '>=':
      return wrapNot({'range': {[left]: {'gte': right}}}, negative);
    case '<':
      return wrapNot({'range': {[left]: {'lt': right}}}, negative);
    case '<=':
      return wrapNot({'range': {[left]: {'lte': right}}}, negative);
    case 'in':
      return wrapNot({'terms': {[left]: Array.isArray(right) ? right : [right]}}, negative);
    case '!in':
      return wrapNot({'terms': {[left]: Array.isArray(right) ? right : [right]}}, !negative);
    case 'like':
      return wrapNot({'wildcard': {[left]: String(right)}}, negative);
    case '!like':
      return wrapNot({'wildcard': {[left]: String(right)}}, !negative);
    case 'ilike':
      return wrapNot({
        'wildcard': {
          [left]: {
            'value': String(right),
            "case_insensitive": true
          }
        }
      }, negative);
    case '!ilike':
      return wrapNot({
        'wildcard': {
          [left]: {
            'value': String(right),
            "case_insensitive": true
          }
        }
      }, !negative)
  }
  throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
}

const wrapNot = (o: object, negative?: boolean) =>
    negative ? {'bool': {'must_not': o}} : o;
