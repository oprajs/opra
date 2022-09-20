import { Response } from 'supertest';
import { ApiExpectErrors } from './api-expect-errors.js';
import { ApiExpectList } from './api-expect-list.js';
import { ApiExpectResource } from './api-expect-resource.js';

export class ApiExpect {
  protected _bodyResource?: ApiExpectResource;
  protected _bodyList?: ApiExpectList;
  protected _bodyErrors?: ApiExpectErrors;

  constructor(readonly response: Response) {
  }

  status(value: number): this {
    expect(this.response.status).toEqual(value);
    return this;
  }

  get bodyAsResource(): ApiExpectResource {
    return this._bodyResource =
        this._bodyResource || new ApiExpectResource(this.response.body);
  }

  get bodyAsList(): ApiExpectList {
    return this._bodyList =
        this._bodyList || new ApiExpectList(this.response.body);
  }

  toSuccess(status: number = 200): this {
    expect(this.response.body.errors).toStrictEqual(undefined);
    expect(this.response.status).toEqual(status);
    return this;
  }

  get errors(): ApiExpectErrors {
    return this._bodyErrors =
        this._bodyErrors || new ApiExpectErrors(this.response.body);
  }

  /*
    bodyIsResourceList(options?: ListResourcesOptions): this {
      const body = this.response.body;
      expect(body).toBeDefined();
      expect(body.items).toBeDefined();
      expect(body.items.length).toBeGreaterThanOrEqual(0);
      expect(body.count).toEqual(body.items.length);
      if (options) {
        if (options.limit)
          expect(body.count).toBeLessThanOrEqual(options.limit);
        if (options.offset)
          expect(body.offset).toEqual(options.offset);
        if (options.total)
          expect(body.total).toBeGreaterThanOrEqual(body.count);
        if (options.distinct)
          expect(body.distinct).toEqual(true);
        if (options.elements) {
          expect(body.items).toEqual(
              expect.arrayContaining([expect.objectHaveKeysOnly(options.elements)])
          );
        }
        if (options.include) {
          const matcher = options.include.reduce((a, k) => {
            a[k] = expect.anything();
            return a;
          }, {});
          expect(body.items).toContainEqual(expect.objectContaining(matcher));
        }
        if (options.exclude) {
          const matcher = options.exclude.reduce((a, k) => {
            a[k] = expect.anything();
            return a;
          }, {});
          expect(body.items).not.toContainEqual(expect.objectContaining(matcher));
        }
        if (options.sort) {
          const sortFields = options.sort;
          expect(body.items).toBeSorted((a, b) => {
            for (const sortField of sortFields) {
              const l = a[sortField];
              const r = b[sortField];
              if (l < r) return +1;
              if (l > r) return 1;
            }
            return 0;
          });
        }

        if (options.filter) {
          const matcher = options.filter.reduce((a, k) => {
            a[k.element] = k.expect || k.value;
            return a;
          }, {});
          try {
            expect(body.items.length).toBeGreaterThan(0);
          } catch (e) {
            throw new Error('Api returned no items');
          }
          expect(body.items).toEqual(
              expect.not.arrayContaining([expect.not.objectMatches(matcher)])
          );
        }
      }

      return this;
    }
  */
  /*
    error(...issue: any[]): this {
      try {
        expect(this.response.body.issues).toBeDefined();
      } catch (e) {
        throw new Error('No error issue returned');
      }
      expect(this.response.body.issues).toEqual(
          expect.arrayContaining(
              issue.map(o => expect.objectContaining(o))
          )
      );
      return this;
    }
  */
}
