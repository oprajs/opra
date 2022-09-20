import ruleJudgment from 'rule-judgment'
import {
  $parse, ArrayExpression, BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/url';
import { ApiExpectBody } from './api-expect-body.js';

export class ApiExpectList extends ApiExpectBody {

  constructor(protected _body: any) {
    super();
  }

  get items() {
    return this._body.items;
  }

  toMatch<T extends {}>(value: T): this {
    return this._toMatchObject(this._body.items || [], value);
  }

  haveKeysOnly(keys: string[]): this {
    this._haveKeysOnly(this._body.items || [], keys);
    return this;
  }

  haveKeys(keys: string[]): this {
    this._haveKeys(this._body.items || [], keys);
    return this;
  }

  notHaveKeys(keys: string[]): this {
    this._notHaveKeys(this._body.items || [], keys);
    return this;
  }

  toBeSortedBy(...fields: string[]): this {
    const fieldsMap = fields.map(x => x.split('.'));
    const getValue = (obj: any, fieldMap: string[]) => {
      let v = obj;
      let i = 0;
      while (v && i < fieldMap.length) {
        v = v[fieldMap[i++]];
      }
      return v;
    }

    expect(this._body.items).toBeSorted((a, b) => {
      for (const sortField of fieldsMap) {
        const l = getValue(a, sortField);
        const r = getValue(b, sortField);
        if (l < r) return -1;
        if (l > r) return 1;
      }
      return 0;
    });
    return this;
  }

  toBeFilteredBy(filter: string | Expression): this {
    const f = convertFilter(filter);
    if (f) {
      const j = ruleJudgment(f);
      const filtered = this._body.items.filter(j);
      expect(this._body.items).toStrictEqual(filtered);
    }
    return this;
  }

  toHaveExactItems(expected: number) {
    return expect(this._body.items.length).toStrictEqual(expected);
  }

  toHaveMaxItems(expected: number) {
    return expect(this._body.items.length).toBeLessThanOrEqual(expected);
  }

  toHaveMinItems(expected: number) {
    return expect(this._body.items.length).toBeGreaterThanOrEqual(expected);
  }

}

export function convertFilter(str: string | Expression | undefined): any {
  const ast = typeof str === 'string' ? $parse(str) : str;
  if (!ast)
    return;

  if (ast instanceof ComparisonExpression) {
    const left = convertFilter(ast.left);
    const right = convertFilter(ast.right);

    switch (ast.op) {
      case '=':
        return {$eq: {[left]: right}};
      case '!=':
        return {$ne: {[left]: right}};
      case '>':
        return {$gt: {[left]: right}};
      case '>=':
        return {$gte: {[left]: right}};
      case '<':
        return {$lt: {[left]: right}};
      case '<=':
        return {$lte: {[left]: right}};
      case 'in':
        return {$in: {[left]: right}};
      case '!in':
        return {$nin: {[left]: right}};
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
    return ast.items.map(convertFilter);
  }
  if (ast instanceof LogicalExpression) {
    if (ast.op === 'or')
      return {$or: ast.items.map(convertFilter)};
    return {$and: ast.items.map(convertFilter)};
  }
  if (ast instanceof ArrayExpression) {
    return ast.items.map(convertFilter);
  }
  if (ast instanceof ParenthesesExpression) {
    return convertFilter(ast.expression);
  }
  throw new Error(`${ast.type} is not implemented yet`);
}
