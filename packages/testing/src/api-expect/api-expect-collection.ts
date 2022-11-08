import _ from 'lodash';
import ruleJudgment from 'rule-judgment'
import { OpraResponse } from '@opra/client';
import {
  $parse, ArrayExpression, BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/url';

export class ApiExpectCollection {

  constructor(readonly response: OpraResponse, protected _isNot: boolean = false) {
  }

  get not(): ApiExpectCollection {
    return new ApiExpectCollection(this.response, !this._isNot);
  }

  forEach(callbackfn: (v: any) => void): this {
    (this.response.data as any[]).forEach(callbackfn);
    return this;
  }

  toMatch<T extends {}>(expected: T): this {
    try {
      const v = _.omitBy(expected, _.isNil);
      for (const item of this.response.data) {
        this._expect(item).toMatchObject(v);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  toHaveFields(keys: string[]): this {
    try {
      for (const item of this.response.data) {
        this._expect(item).toHaveFields(keys);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveFields);
      throw e;
    }
    return this;
  }

  toHaveFieldsOnly(keys: string[]): this {
    try {
      for (const item of this.response.data) {
        this._expect(item).toHaveFieldsOnly(keys);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveFieldsOnly);
      throw e;
    }
    return this;
  }

  //
  // toHaveProperty(keyPath, value?): this {
  //   try {
  //     for (const item of this.response.data) {
  //       this._expect(item).toHaveProperty(keyPath, value);
  //     }
  //
  //   } catch (e: any) {
  //     Error.captureStackTrace(e, this.toHaveProperty);
  //     throw e;
  //   }
  //   return this;
  // }

  toBeSortedBy(...fields: string[]): this {
    try {
      this._expect(this.response.data).toBeSortedBy(fields);
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
      const filtered = this.response.data.filter(j);
      try {
        this._expect(this.response.data).toStrictEqual(filtered);
      } catch (e: any) {
        Error.captureStackTrace(e, this.toBeFilteredBy);
        throw e;
      }
    }
    return this;
  }

  toHaveExactItems(expected: number): this {
    try {
      this._expect(this.response.data).toHaveLength(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveExactItems);
      throw e;
    }
    return this;
  }

  toHaveMaxItems(expected: number): this {
    try {
      this._expect(this.response.data.length).toBeLessThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveMaxItems);
      throw e;
    }
    return this;
  }

  toHaveMinItems(expected: number): this {
    try {
      this._expect(this.response.data.length).toBeGreaterThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveMinItems);
      throw e;
    }
    return this;
  }

  protected _expect(expected: any): jest.Matchers<any> {
    const out = expect(expected);
    if (this._isNot) return out.not;
    return out;
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
