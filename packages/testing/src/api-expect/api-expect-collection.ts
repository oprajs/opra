import ruleJudgmentLib from 'rule-judgment';
import typeIs from '@browsery/type-is';
import { MimeTypes, omitNullish, OpraFilter } from '@opra/common';
import { ApiExpectBase } from './api-expect-base.js';

// @ts-ignore
const ruleJudgment = typeof ruleJudgmentLib === 'object' ? ruleJudgmentLib.default : ruleJudgmentLib;

export class ApiExpectCollection extends ApiExpectBase {
  get not(): ApiExpectCollection {
    return new ApiExpectCollection(this.response, !this.isNot);
  }

  /**
   * Tests if Collection have number of items in payload
   * @param min Minimum number of items. Default 1
   * @param max Maximum number of items
   */
  toReturnItems(min?: number, max?: number): this {
    let msg = '';
    try {
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      msg += `Payload should be array.`;
      this._expect(Array.isArray(data)).toBeTruthy();
      msg += `The length of payload array do not match. `;
      const l = data.length;
      this._expect(l).toBeGreaterThanOrEqual(min || 1);
      if (max) this._expect(l).toBeLessThanOrEqual(max);
    } catch (e: any) {
      if (msg) e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnItems);
      throw e;
    }
    return this;
  }

  toContainTotalMatches(min?: number, max?: number): this {
    let msg = '';
    try {
      msg += `The value of "totalMatches" do not match. `;
      const l = this.response.body.totalMatches;
      this._expect(l).toBeGreaterThanOrEqual(min || 1);
      if (max) this._expect(l).toBeLessThanOrEqual(max);
    } catch (e: any) {
      if (msg) e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnItems);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Collection items matches given object
   * @param expected
   */
  toMatch<T extends {}>(expected: T): this {
    try {
      expected = omitNullish(expected) as T;
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      for (const x of data) {
        this._expect(x).toMatchObject(expected);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Collection items has all of provided fields.
   * @param fields
   */
  toContainFields(fields: string | string[]): this {
    try {
      fields = Array.isArray(fields) ? fields : [fields];
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      for (const item of data) {
        this._expect(Object.keys(item)).toEqual(expect.arrayContaining(fields));
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainFields);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Collection items only contains all of provided fields.
   * @param fields
   */
  toContainAllFields(fields: string | string[]): this {
    try {
      fields = Array.isArray(fields) ? fields : [fields];
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      for (const item of data) {
        this._expect(Object.keys(item)).toEqual(fields);
      }
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainAllFields);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Collection is sorted by given field(s).
   * @param fields
   */
  toBeSortedBy(fields: string | string[]): this {
    try {
      fields = Array.isArray(fields) ? fields : [fields];
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      (this._expect(data) as any).opraCollectionToBeSortedBy(fields);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeSortedBy);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Collection is filtered by given condition.
   * @param filter
   */
  toBeFilteredBy(filter: string | OpraFilter.Expression): this {
    const f = convertFilter(filter);
    if (f) {
      const j = ruleJudgment(f);
      const data = typeIs.is(this.response.contentType, [MimeTypes.opra_response_json])
        ? this.response.body.payload
        : this.response.body;
      const filtered = data.filter(j);
      try {
        this._expect(data).toStrictEqual(filtered);
      } catch (e: any) {
        Error.captureStackTrace(e, this.toBeFilteredBy);
        throw e;
      }
    }
    return this;
  }
}

expect.extend({
  opraCollectionToBeSortedBy(received, properties: string[]) {
    const fieldsMap = properties.map(x => x.split('.'));
    const getValue = (obj: any, fieldMap: string[]) => {
      let v = obj;
      let i = 0;
      while (v && i < fieldMap.length) {
        v = v[fieldMap[i++]];
      }
      return v;
    };
    let pass = true;
    let message;
    if (pass) {
      const sorted = [...(received || [])];
      sorted.sort((a, b) => {
        for (const sortField of fieldsMap) {
          const l = getValue(a, sortField);
          const r = getValue(b, sortField);
          if (l < r) return -1;
          if (l > r) return 1;
        }
        return 0;
      });
      try {
        expect(received).toEqual(sorted);
      } catch (e) {
        pass = false;
        message = () => 'Items are not sorted as expected';
      }
    }
    return {
      actual: received,
      message,
      pass,
    };
  },
});

export function convertFilter(str: string | OpraFilter.Expression | undefined): any {
  const ast = typeof str === 'string' ? OpraFilter.parse(str) : str;
  if (!ast) return;

  if (ast instanceof OpraFilter.ComparisonExpression) {
    const left = convertFilter(ast.left);
    const right = convertFilter(ast.right);

    switch (ast.op) {
      case '=':
        return { $eq: { [left]: right } };
      case '!=':
        return { $ne: { [left]: right } };
      case '>':
        return { $gt: { [left]: right } };
      case '>=':
        return { $gte: { [left]: right } };
      case '<':
        return { $lt: { [left]: right } };
      case '<=':
        return { $lte: { [left]: right } };
      case 'in':
        return { $in: { [left]: right } };
      case '!in':
        return { $nin: { [left]: right } };
      default:
        throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
    }
  }
  if (ast instanceof OpraFilter.QualifiedIdentifier) {
    return ast.value;
  }
  if (
    ast instanceof OpraFilter.NumberLiteral ||
    ast instanceof OpraFilter.StringLiteral ||
    ast instanceof OpraFilter.BooleanLiteral ||
    ast instanceof OpraFilter.NullLiteral ||
    ast instanceof OpraFilter.DateLiteral ||
    ast instanceof OpraFilter.TimeLiteral
  ) {
    return ast.value;
  }
  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(convertFilter);
  }
  if (ast instanceof OpraFilter.LogicalExpression) {
    if (ast.op === 'or') return { $or: ast.items.map(convertFilter) };
    return { $and: ast.items.map(convertFilter) };
  }
  if (ast instanceof OpraFilter.ArrayExpression) {
    return ast.items.map(convertFilter);
  }
  if (ast instanceof OpraFilter.ParenthesizedExpression) {
    return convertFilter(ast.expression);
  }
  throw new Error(`${ast.kind} is not implemented yet`);
}
