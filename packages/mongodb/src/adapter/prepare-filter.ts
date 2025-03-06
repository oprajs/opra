import { OpraFilter } from '@opra/common';
import mongodb from 'mongodb';
import type { MongoAdapter } from './mongo-adapter';

const opMap = {
  '=': '$eq',
  '!=': '$ne',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
  in: '$in',
  '!in': '$nin',
};

/**
 * Prepare the MongoDB filter based on the provided filters and options.
 *
 * @param {FilterInput|FilterInput[]} filters - The filter(s) to be applied.
 * @param {Object} [options] - Additional options.
 * @param {string} [options.fieldPrefix] - The prefix to be added to field names.
 *
 * @returns {mongodb.Filter<any>} - The prepared MongoDB filter.
 */
export default function prepareFilter<T = any>(
  filters: MongoAdapter.FilterInput<T> | MongoAdapter.FilterInput<T>[],
  options?: {
    fieldPrefix?: string;
  },
): mongodb.Filter<T> | undefined {
  const filtersArray = Array.isArray(filters) ? filters : [filters];
  if (!filtersArray.length) return {};
  let i = 0;
  const out: any = {};
  for (const filter of filtersArray) {
    if (!filter) continue;
    let x: any;
    if (typeof filter === 'string')
      x = prepareFilterAst(OpraFilter.parse(filter));
    else if (filter instanceof OpraFilter.Expression)
      x = prepareFilterAst(filter);
    else x = filter;
    if (Array.isArray(x)) x = { $and: out };

    // Merge $and arrays
    if (x.$and) {
      out.$and = out.$and || [];
      out.$and.push(...x.$and);
      delete x.$and;
    }
    // Merge $or arrays
    if (x.$or) {
      out.$or = out.$or || [];
      out.$or.push(...x.$or);
      delete x.$or;
    }
    for (const k of Object.keys(x)) {
      // If result object has filter field we convert it to $and
      if (out[k]) {
        out.$and = out.$and || [];
        out.$and.push({ [k]: out[k] });
        out.$and.push({ [k]: x[k] });
        delete out[k];
        continue;
      }
      out[k] = x[k];
    }
    i++;
  }
  return i
    ? options?.fieldPrefix
      ? addPrefix(out, options.fieldPrefix)
      : out
    : undefined;
}

function addPrefix(source: any, prefix: string): any {
  if (typeof source !== 'object') return source;
  if (Array.isArray(source)) return source.map(v => addPrefix(v, prefix));
  const out: any = {};
  for (const [k, v] of Object.entries(source)) {
    if (k.startsWith('$')) out[k] = addPrefix(v, prefix);
    else out[prefix + k] = addPrefix(v, prefix);
  }
  return out;
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
      .map(x => prepareFilterAst(x, negative))
      .filter(x => x != null) as mongodb.Filter<any>[];
    if (ast.op === 'or') return { $or: items };
    return { $and: items };
  }

  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return prepareFilterAst(ast.expression, negative);
  }

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = prepareFilterAst(ast.left, negative);

    if (ast.right instanceof OpraFilter.QualifiedIdentifier) {
      const op = opMap[ast.op];
      if (op) return { $expr: { [op]: ['$' + left, '$' + ast.right.value] } };
      /* istanbul ignore next */
      throw new Error(`Invalid filter query.`);
    }

    let right = prepareFilterAst(ast.right);
    if (right == null) {
      const op =
        ast.op === '=' ? (negative ? '!=' : '=') : negative ? '=' : '!=';
      if (op === '=')
        return { $or: [{ [left]: null }, { [left]: { $exists: false } }] };
      if (op === '!=')
        return {
          $and: [{ $ne: { [left]: null } }, { [left]: { $exists: true } }],
        };
    }

    if (ast.prepare) {
      const x = ast.prepare({
        left,
        right,
        op: ast.op,
        adapter: 'mongodb',
      });
      if (x) return x;
    }

    const mngOp = opMap[ast.op];
    if (mngOp) {
      if (ast.op === 'in' || ast.op === '!in')
        right = Array.isArray(right) ? right : [right];
      if (ast.op === '=' && !negative) return { [left]: right };
      return { [left]: wrapNot({ [mngOp]: right }, negative) };
    }

    switch (ast.op) {
      case 'like':
        return {
          [left]: wrapNot(
            {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
                $caseSensitive: true,
              },
            },
            negative,
          ),
        };
      case 'ilike':
        return {
          [left]: wrapNot(
            {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
              },
            },
            negative,
          ),
        };
      case '!like':
        return {
          [left]: wrapNot(
            {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
                $caseSensitive: true,
              },
            },
            !negative,
          ),
        };
      case '!ilike':
        return {
          [left]: wrapNot(
            {
              $text: {
                $search: '\\"' + right.replace(/\\"/, '"') + '\\"',
              },
            },
            !negative,
          ),
        };
      default:
        break;
    }

    throw new Error(
      `Unimplemented ComparisonExpression operation (right side is ${ast.right.kind})`,
    );
  }

  throw new Error(`${ast.kind} is not implemented yet`);
}

const wrapNot = (o: object, negative?: boolean) => (negative ? { $not: o } : o);
