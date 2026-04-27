import '@opra/core';
import { OpraFilter } from '@opra/common';
import { Operators, sql } from '@sqb/builder';
import { vg } from 'valgen';
import type { SQBAdapter } from '../sqb-adapter.js';

/**
 * Prepares the SQB filter based on the provided filters and options.
 *
 * @param filters - The filter(s) to be applied. Can be a single filter or an array of filters.
 * @returns The prepared SQB Expression, or `undefined` if no filters are provided.
 */
export default function prepareFilter(
  filters: SQBAdapter.FilterInput | SQBAdapter.FilterInput[],
): any {
  const filtersArray = Array.isArray(filters) ? filters : [filters];
  if (!filtersArray.length) return undefined;

  const arr: any[] = [];
  for (const filter of filtersArray) {
    if (!filter) continue;

    let ast: any;
    if (typeof filter === 'string')
      ast = prepareFilterAst(OpraFilter.parse(filter));
    else if (filter instanceof OpraFilter.Expression)
      ast = prepareFilterAst(filter);
    else ast = filter;
    if (ast) arr.push(ast);
  }
  return arr.length > 1 ? sql.And(...arr) : arr[0];
}

const _isDate = vg.isDate({ trim: 'day' });
const _isDateTime = vg.isDate();

function prepareFilterAst(ast?: OpraFilter.Expression): any {
  if (!ast) return;

  if (ast instanceof OpraFilter.DateLiteral) {
    return _isDate(ast.value, { coerce: true });
  }

  if (ast instanceof OpraFilter.DateTimeLiteral) {
    return _isDateTime(ast.value, { coerce: true });
  }

  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(prepareFilterAst);
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return sql.Not(prepareFilterAst(ast.expression));
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    if (ast.op === 'or') return sql.Or(...ast.items.map(prepareFilterAst));
    return sql.And(...ast.items.map(prepareFilterAst));
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return prepareFilterAst(ast.expression);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = String(ast.left);
    const right = prepareFilterAst(ast.right);
    if (ast.prepare) {
      const x = ast.prepare({
        left,
        right,
        op: ast.op,
        adapter: 'sqb',
      });
      if (x) return x;
    }
    switch (ast.op) {
      case 'like':
        return sql.Like(left, String(right).replace(/\*/g, '%'));
      case 'ilike':
        return sql.ILike(left, String(right).replace(/\*/g, '%'));
      case '!like':
        return sql.NotLike(left, String(right).replace(/\*/g, '%'));
      case '!ilike':
        return sql.NotILike(left, String(right).replace(/\*/g, '%'));
    }
    const fn: Function | undefined = Operators[ast.op];
    if (fn) return fn(left, right);
    throw new Error(
      `ComparisonExpression operator (${ast.op}) not implemented yet`,
    );
  }

  if (
    ast instanceof OpraFilter.QualifiedIdentifier ||
    ast instanceof OpraFilter.Literal
  ) {
    return ast.value;
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}
