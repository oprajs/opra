import '@opra/core';
import type { estypes } from '@elastic/elasticsearch';
import { OpraFilter } from '@opra/common';
import { type ElasticAdapter } from '../elastic-adapter.js';

export default function prepareFilter(
  filters: ElasticAdapter.FilterInput | ElasticAdapter.FilterInput[],
): estypes.QueryDslQueryContainer | undefined {
  const filtersArray = Array.isArray(filters) ? filters : [filters];
  if (!filtersArray.length) return;
  const out: estypes.QueryDslQueryContainer[] = [];
  for (const filter of filtersArray) {
    if (!filter) continue;
    let x: any = filter;
    if (typeof filter === 'string')
      x = prepareFilterAst(OpraFilter.parse(filter));
    else if (filter instanceof OpraFilter.Expression)
      x = prepareFilterAst(filter);
    out.push(x);
  }
  if (out.length > 1) {
    return { bool: { must: [...out] } };
  }
  return out[0] ? out[0] : undefined;
}

function prepareFilterAst(
  ast: OpraFilter.Expression | undefined,
  negative?: boolean,
): any {
  if (!ast) return;

  if (
    ast instanceof OpraFilter.QualifiedIdentifier ||
    ast instanceof OpraFilter.Literal
  ) {
    return ast.value;
  }

  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(x => prepareFilterAst(x, negative));
  }

  if (ast instanceof OpraFilter.NegativeExpression) {
    return prepareFilterAst(ast.expression, !negative);
  }

  if (ast instanceof OpraFilter.LogicalExpression) {
    const items = ast.items
      .map(x => prepareFilterAst(x))
      /** Filter nullish items */
      .filter(x => x != null);
    const k = (ast.op === 'or' ? 'should' : 'must') + (negative ? '_not' : '');
    return { bool: { [k]: items } };
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return prepareFilterAst(ast.expression, negative);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    if (
      !(
        ast.left instanceof OpraFilter.QualifiedIdentifier ||
        ast.left instanceof OpraFilter.StringLiteral
      )
    ) {
      throw new Error(
        'Left side of ComparisonExpression must be a QualifiedIdentifier',
      );
    }
    const left = prepareFilterAst(ast.left);
    const right = prepareFilterAst(ast.right);

    let out: any;
    if (right == null) {
      negative = !negative;
      out = { exists: { field: left } };
    } else {
      if (ast.prepare) {
        out = ast.prepare(right, ast.op);
      }
      if (!out) {
        switch (ast.op) {
          case '!=':
          case '=':
          case 'in':
          case '!in': {
            out = Array.isArray(right)
              ? { terms: { [left]: right } }
              : { match: { [left]: right } };
            break;
          }
          case '>': {
            out = { range: { [left]: { gt: right } } };
            break;
          }
          case '>=': {
            out = { range: { [left]: { gte: right } } };
            break;
          }
          case '<': {
            out = { range: { [left]: { lt: right } } };
            break;
          }
          case '<=': {
            out = { range: { [left]: { lte: right } } };
            break;
          }
          case '!like':
          case 'like': {
            out = {
              wildcard: { [left]: { value: String(right).replace(/%/g, '*') } },
            };
            break;
          }
          case '!ilike':
          case 'ilike': {
            out = {
              wildcard: {
                [left]: {
                  value: String(right).replace(/%/g, '*'),
                  case_insensitive: true,
                },
              },
            };
            break;
          }
          default:
            /* istanbul ignore next */
            throw new TypeError(
              `Unknown ComparisonExpression operation (${ast.op})`,
            );
        }
      }
    }
    if (
      (ast.op.startsWith('!') && !negative) ||
      (!ast.op.startsWith('!') && negative)
    ) {
      return { bool: { must_not: { ...out } } };
    }
    return out;
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}
