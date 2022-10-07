import _ from 'lodash';
import ruleJudgment from 'rule-judgment'
import { Response } from 'supertest';
import {
  $parse, ArrayExpression, BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/url';

export class ApiExpectList {

  constructor(readonly response: Response) {

  }

  get body() {
    return this.response.body;
  }

  get items(): any[] {
    return this.response.body.items;
  }

  toMatch<T extends {}>(expected: T): this {
    try {
      const v = _.omitBy(expected, _.isNil);
      for (const item of this.response.body.items) {
        expect(item).toMatchObject(v);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  toContainAllKeys(keys: string[]): this {
    try {
      for (const item of this.response.body.items) {
        expect(item).toContainAllKeys(keys);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainAllKeys);
      throw e;
    }
    return this;
  }

  toContainKeys(keys: string[]): this {
    try {
      for (const item of this.response.body.items) {
        expect(item).toContainKeys(keys);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainKeys);
      throw e;
    }
    return this;
  }

  notToContainKeys(keys: string[]): this {
    try {
      for (const item of this.response.body.items) {
        expect(item).not.toContainKeys(keys);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.notToContainKeys);
      throw e;
    }
    return this;
  }

  toHaveProperty(keyPath, value?): this {
    try {
      for (const item of this.response.body.items) {
        expect(item).toHaveProperty(keyPath, value);
      }

    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveProperty);
      throw e;
    }
    return this;
  }

  toBeSortedBy(...fields: string[]): this {
    try {
      for (const item of this.response.body.items) {
        expect(item).toBeSortedBy(fields);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeSortedBy);
      throw e;
    }
    return this;
  }

  toBeFilteredBy(filter: string | Expression): this {
    const f = convertFilter(filter);
    if (f) {
      const j = ruleJudgment(f);
      const filtered = this.response.body.items.filter(j);
      try {
        expect(this.response.body.items).toStrictEqual(filtered);
      } catch (e: any) {
        Error.captureStackTrace(e, this.toBeFilteredBy);
        throw e;
      }
    }
    return this;
  }

  toHaveExactItems(expected: number) {
    try {
      return expect(this.response.body.items).toHaveLength(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveExactItems);
      throw e;
    }
  }

  toHaveMaxItems(expected: number) {
    try {
      return expect(this.response.body.items.length).toBeLessThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveMaxItems);
      throw e;
    }
  }

  toHaveMinItems(expected: number) {
    try {
      return expect(this.response.body.items.length).toBeGreaterThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveMinItems);
      throw e;
    }
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
  throw new Error(`${ast.kind} is not implemented yet`);
}
