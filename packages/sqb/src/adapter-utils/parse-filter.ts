import '@opra/core';
import { OpraFilter } from '@opra/common';
import * as sqb from '@sqb/builder';
import { isDate } from 'valgen';
import type { SQBAdapter } from '../sqb-adapter.js';

/**
 * Prepare the SQB filter based on the provided filters and options.
 *
 * @param {SQBAdapter.FilterInput|SQBAdapter.FilterInput[]} filters - The filter(s) to be applied.
 *
 * @returns {Expression} - The prepared SQB Expression.
 */
export default function parseFilter(filters: SQBAdapter.FilterInput | SQBAdapter.FilterInput[]): any {
  const filtersArray = Array.isArray(filters) ? filters : [filters];
  if (!filtersArray.length) return undefined;

  const arr: any[] = [];
  for (const filter of filtersArray) {
    if (!filter) continue;

    let ast: any;
    if (typeof filter === 'string') ast = prepareFilterAst(OpraFilter.parse(filter));
    else if (filter instanceof OpraFilter.Expression) ast = prepareFilterAst(filter);
    else ast = filter;
    if (ast) arr.push(ast);
  }
  return arr.length > 1 ? sqb.And(...arr) : arr[0];
}

function prepareFilterAst(ast?: OpraFilter.Expression): any {
  if (!ast) return;

  if (
    ast instanceof OpraFilter.QualifiedIdentifier ||
    ast instanceof OpraFilter.NumberLiteral ||
    ast instanceof OpraFilter.StringLiteral ||
    ast instanceof OpraFilter.BooleanLiteral ||
    ast instanceof OpraFilter.NullLiteral ||
    ast instanceof OpraFilter.TimeLiteral
  ) {
    return ast.value;
  }

  if (ast instanceof OpraFilter.DateLiteral) {
    return isDate(ast.value, { coerce: true });
  }

  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(prepareFilterAst);
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return sqb.Not(prepareFilterAst(ast.expression));
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    if (ast.op === 'or') return sqb.Or(...ast.items.map(prepareFilterAst));
    return sqb.And(...ast.items.map(prepareFilterAst));
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return prepareFilterAst(ast.expression);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = String(ast.left);
    const right = prepareFilterAst(ast.right);
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
        return sqb.Like(left, String(right).replace(/\*/g, '%'));
      case 'ilike':
        return sqb.Ilike(left, String(right).replace(/\*/g, '%'));
      case '!like':
        return sqb.NotLike(left, String(right).replace(/\*/g, '%'));
      case '!ilike':
        return sqb.NotILike(left, String(right).replace(/\*/g, '%'));
      default:
        throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
    }
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}
